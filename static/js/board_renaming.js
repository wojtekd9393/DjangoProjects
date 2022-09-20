$(document).ready(function () {
    // handlers
    let spanRetroName = document.querySelector("span.retro-name");
    let iconRetroName = document.querySelector("i.retro-name");
    let inputRetroName = document.querySelector("input.input-retro-name");
    let rejectButton = document.querySelector("button.reject");
    let acceptButton = document.querySelector("button.accept");

    [spanRetroName, iconRetroName].forEach(item => {
        item.addEventListener("click", () => {
            spanRetroName.classList.add("hidden");
            iconRetroName.style.display = "none";
            inputRetroName.classList.remove("hidden");
            inputRetroName.value = spanRetroName.innerHTML;
            $(inputRetroName).focus();
            rejectButton.classList.remove("hidden");
            acceptButton.classList.remove("hidden");
        })
    })

    rejectButton.addEventListener("click", () => {
        inputRetroName.classList.add("hidden");
        rejectButton.classList.add("hidden");
        acceptButton.classList.add("hidden");
        spanRetroName.classList.remove("hidden");
        iconRetroName.style.display = "inline-block";
    });

    acceptButton.addEventListener("click", () => {
        inputRetroName.classList.add("hidden");
        rejectButton.classList.add("hidden");
        acceptButton.classList.add("hidden");
        spanRetroName.classList.remove("hidden");
        iconRetroName.style.display = "inline-block";

        let newRetroName = inputRetroName.value != "" ? inputRetroName.value : spanRetroName.innerHTML;
        let retroId = acceptButton.getAttribute("data-retro-id");
        spanRetroName.innerHTML = newRetroName;

        var csrfToken = $("input[name=csrfmiddlewaretoken]").val();

        $.ajax({
            url: '/change_retro_name/' + retroId + '/' + newRetroName,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST'
        })
    });
});