 window.onload = function() {
      document.getElementById("terms-modal").style.display = "block";
    };

    document.getElementById("accept-btn").onclick = function() {
      document.getElementById("terms-modal").style.display = "none";
      document.getElementById("terms-modal").style.position = "absolute";
      document.getElementById("terms-modal").style.bottom = "0"; 
    };

    document.getElementById("close-btn").onclick = function() {
      document.getElementById("terms-modal").style.display = "none";
    };