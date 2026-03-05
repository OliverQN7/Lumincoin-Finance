(function () {
    const forms = document.querySelectorAll<HTMLFormElement>('.needs-validation')
    // Loop over them and prevent submission
    forms.forEach(form => {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated')
        });
    })
})()
