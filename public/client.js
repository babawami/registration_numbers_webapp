document.addEventListener('DOMContentLoaded', function () {
    let clearMessage = document.querySelector('.clear');
    if (clearMessage.innerHTML !== '') {
        setTimeout(function () {
            clearMessage.innerHTML = '';
        }, 1000);
    }
});
