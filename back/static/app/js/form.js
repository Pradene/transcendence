document.addEventListener('DOMContentLoaded', function() {
    inputs = document.querySelectorAll(".form--field--label input")

    inputs.forEach(function(input) {
        input.addEventListener("input", function() {
            
            console.log(input)
            console.log(input.nextElementSibling)
            span = input.nextElementSibling
            
            if (input.value.trim() === "") {
                input.style.transform = "translateY(0%)"
                span.style.transform = "translateY(120%) scale(1)"
            } else {
                input.style.transform = "translateY(10%)"
                span.style.transform = "translateY(20%) scale(0.75)"
            }
        })
    })
})