function save_options() {
  var TGD_ENV = document.getElementById('TGD_ENV').value;
  
  localStorage.TGD_ENV=TGD_ENV;
  
  // Update status to let user know options were saved.
  var status = document.getElementById('status');
  
  status.textContent = 'Options saved.';
  
  setTimeout(function() {
    status.textContent = '';
  }, 750);
  
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  
  if (localStorage.TGD_ENV) {
    document.getElementById('TGD_ENV').value = localStorage.TGD_ENV;
  }
  
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);