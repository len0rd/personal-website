// update the title at the top of the document to match the hostname
// used to request the blog
document.addEventListener("DOMContentLoaded", function () {
    var logoTitle = document.querySelector(".logo__title");
    if (logoTitle) {
        logoTitle.textContent = window.location.hostname;
    }
});
