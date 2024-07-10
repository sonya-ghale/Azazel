   // JavaScript code to handle the modal
   const modal = document.getElementById("errorModal");
   const span = document.getElementsByClassName("close")[0];

   // Display the modal
   function showModal() {
       modal.style.display = "block";
   }

   // Close the modal when the "x" is clicked
   span.onclick = function () {
       modal.style.display = "none";
   };

   // Close the modal when the user clicks outside of it
   window.onclick = function (event) {
       if (event.target === modal) {
           modal.style.display = "none";
       }
   };