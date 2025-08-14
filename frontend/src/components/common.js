(function () {
    var forms = document.querySelectorAll('.needs-validation')
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })


})()

export function initSidebarEvents() {
    const profile = document.querySelector('.main__sidebar-profile')
    const logoutBlock = document.querySelector('.main__sidebar-logout')

    if (!profile || !logoutBlock) return;

    profile.addEventListener('click', () => {
        const isVisible = logoutBlock.style.display === 'flex';
        logoutBlock.style.display = isVisible ? 'none' : 'flex';
    })
}