    const noneCheckbox = document.getElementById('none');
    const otherCheckboxes = [document.getElementById('storm'), document.getElementById('wind'), document.getElementById('geo')];

    noneCheckbox.addEventListener('change', function() {
        if (this.checked) {
            otherCheckboxes.forEach(checkbox => checkbox.checked = false);
        }
    });

    otherCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                noneCheckbox.checked = false;
            }
        });
    });
