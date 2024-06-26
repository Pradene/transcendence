document.addEventListener("DOMContentLoaded", animateForm)
document.addEventListener("update", animateForm)

function animateForm() {
    inputs = document.querySelectorAll(".form--field--label input")

    inputs.forEach(function(input) {
        input.addEventListener("input", anim)

        function anim() {
            span = input.nextElementSibling
            
            if (input.value.trim() === "") {
                input.style.transform = "translateY(-50%)"
                span.style.transform = "translateY(-50%) scale(1)"
            } else {
                input.style.transform = "translateY(-20%)"
                span.style.transform = "translateY(-120%) scale(0.75)"
            }
        }
    })
}