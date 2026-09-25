function openLeaderboard() {
      if (currentGuildId) {
        window.open('../leaderboard.html?guild=' + currentGuildId, '_blank');
      } else {
        showToast('Please select a server first.', 'warning');
      }
    }

    // --- EDIT / UPDATE UI WORKFLOW ---
    function showToast(msg, type = 'success') {
      const toast = document.getElementById('global-toast');
      const icon = document.getElementById('toast-icon');
      const text = document.getElementById('toast-text');
      
      toast.className = 'show ' + type;
      text.innerText = msg;
      
      if (type === 'success') icon.innerText = '✅';
      else if (type === 'error') icon.innerText = '❌';
      else if (type === 'warning') icon.innerText = '⚠️';
      
      setTimeout(() => toast.classList.remove('show'), 4000);
    }

    // Override the floating banner logic
    document.querySelectorAll('.floating-save-banner, #floating-save-banner').forEach(el => el.remove());
    
    // Original saveSettings refactored to return success state
    saveSettings = async function(container, inputs, updateBtn, editBtn) {
      updateBtn.innerText = 'Saving...';
      const payload = {
        welcomeChannel: document.getElementById('select-welcome').value,
        levelChannel: document.getElementById('select-level').value,
        logChannel: document.getElementById('select-log').value,
      };

      if (currentSettingsModule === 'Leveling') {
        payload.xpSettings = {
          ...guildSettings.xpSettings,
          minXp: parseInt(document.getElementById('xp-min').value) || 15,
          maxXp: parseInt(document.getElementById('xp-max').value) || 25,
          cooldown: parseInt(document.getElementById('xp-cooldown').value) || 60,
          levelUpMessages: document.getElementById('xp-level-msgs').value.split('\\n').map(l => l.trim()).filter(l => l.length > 0)
        };
      } else if (currentSettingsModule === 'Economy') {
        payload.economySettings = {
          ...guildSettings.economySettings,
          currencySymbol: document.getElementById('econ-symbol').value || '🪙',
          startingBalance: parseInt(document.getElementById('econ-start').value) || 500,
          dailyReward: parseInt(document.getElementById('econ-daily').value) || 100
        };
      } else if (currentSettingsModule === 'Moderation') {
        payload.automodSettings = {
          ...guildSettings.automodSettings,
          antiSpam: document.getElementById('automod-spam').checked,
          antiScamLinks: document.getElementById('automod-scam').checked,
          filterWords: document.getElementById('automod-words').value.split(',').map(w => w.trim()).filter(w => w.length > 0)
        };
      } else if (currentSettingsModule === 'Welcome') {
        payload.welcomeSettings = {
          ...guildSettings.welcomeSettings,
          joinMessage: document.getElementById('welcome-msg').value,
          leaveMessage: document.getElementById('leave-msg').value,
          joinBannerUrl: document.getElementById('welcome-banner').value,
          leaveBannerUrl: document.getElementById('leave-banner').value
        };
        payload.autoRoles = {
          ...guildSettings.autoRoles,
          joinRole: document.getElementById('select-autorole').value
        };
      } else if (currentSettingsModule === 'AI') {
        payload.aiSettings = {
          ...guildSettings.aiSettings,
          channelId: document.getElementById('ai-channel').value,
          systemInstruction: document.getElementById('ai-instruction').value
        };
      } else if (currentSettingsModule === 'Tickets') {
        payload.ticketSettings = {
          ...guildSettings.ticketSettings,
          staffRoleId: document.getElementById('ticket-staff').value
        };
      }

      try {
        const res = await fetch(`/api/guilds/${currentGuildId}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.success) {
          guildSettings = data.settings;
          showToast('Updated successfully!', 'success');
          inputs.forEach(input => input.disabled = true);
          updateBtn.style.display = 'none';
          editBtn.style.display = 'inline-flex';
        } else {
          showToast(data.error || 'Failed to update.', 'error');
          // Leave fields enabled so user can fix
        }
      } catch (err) {
        showToast('Network error while saving.', 'error');
      }
      updateBtn.innerText = 'Update';
    };
    
    saveGeneralSettings = async function(container, inputs, updateBtn, editBtn) {
        updateBtn.innerText = 'Saving...';
        const rolesEl = document.getElementById('bot-manager-roles');
        const managerRoles = Array.from(rolesEl.querySelectorAll('input:checked')).map(cb => cb.value);

        const payload = {
          prefix: document.getElementById('bot-prefix').value || '/',
          nickname: document.getElementById('bot-nickname').value || '',
          timezone: document.getElementById('bot-timezone').value || 'UTC',
          managerRoles: managerRoles
        };
        
        try {
          const res = await fetch(`/api/guilds/${currentGuildId}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
          });
          const data = await res.json();
          
          if (data.success) {
            guildSettings = data.settings;
            showToast('Updated successfully!', 'success');
            inputs.forEach(input => input.disabled = true);
            updateBtn.style.display = 'none';
            editBtn.style.display = 'inline-flex';
          } else {
            showToast(data.error || 'Update failed.', 'error');
          }
        } catch (err) {
          showToast('Network error while saving.', 'error');
        }
        updateBtn.innerText = 'Update';
    };

    document.addEventListener("DOMContentLoaded", () => {
      // Apply Edit/Update workflow to standard forms
      const updatableSections = [
        '#tab-general', '#mod-settings-Leveling', '#mod-settings-Moderation', 
        '#mod-settings-Welcome', '#mod-settings-Economy', '#mod-settings-AI', '#mod-settings-Tickets'
      ];
      
      updatableSections.forEach(selector => {
         const container = document.querySelector(selector);
         if (!container) return;
         
         const inputs = container.querySelectorAll('input, select, textarea');
         if (inputs.length === 0) return;
         
         const btnDiv = document.createElement('div');
         btnDiv.className = 'edit-actions';
         btnDiv.style.cssText = 'margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 16px;';
         btnDiv.innerHTML = `
           <button class="btn btn-gray btn-sm edit-btn">✏️ Edit</button>
           <button class="btn btn-accent btn-sm update-btn" style="display:none;">💾 Update</button>
         `;
         container.appendChild(btnDiv);
         
         // Disable all inputs initially
         inputs.forEach(input => input.disabled = true);
         
         const editBtn = btnDiv.querySelector('.edit-btn');
         const updateBtn = btnDiv.querySelector('.update-btn');
         
         let initialState = {};
         
         editBtn.addEventListener('click', () => {
           inputs.forEach(input => {
              input.disabled = false;
              initialState[input.id || input.name || Math.random()] = input.type === 'checkbox' ? input.checked : input.value;
           });
           editBtn.style.display = 'none';
           updateBtn.style.display = 'inline-flex';
         });
         
         updateBtn.addEventListener('click', async () => {
           let hasChanges = false;
           inputs.forEach(input => {
              const current = input.type === 'checkbox' ? input.checked : input.value;
              if (current !== initialState[input.id || input.name || Math.random()]) hasChanges = true;
           });
           
           if (!hasChanges) {
             showToast('No changes made.', 'warning');
             inputs.forEach(input => input.disabled = true);
             updateBtn.style.display = 'none';
             editBtn.style.display = 'inline-flex';
             return;
           }
           
           if (selector === '#tab-general') {
               await saveGeneralSettings(container, inputs, updateBtn, editBtn);
           } else {
               await saveSettings(container, inputs, updateBtn, editBtn);
           }
         });
      });
    });
  
