$(document).ready(function () {
    var csrfToken = $("input[name=csrfmiddlewaretoken]").val();

    $("#greenList, #redList, #blueList").on("click", ".fa-thumbs-up", function (event) {
        event.stopPropagation();
        var cardId = $(this).data('id');

        $.ajax({
            url: '/vote/' + cardId,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST',
            success: function (response) {
                let p = document.querySelectorAll('div.vote[data-id="' + cardId + '"] > p')[0];
                let currentNumberOfVotes = p.innerHTML;
                p.innerHTML = parseInt(currentNumberOfVotes, 10) + 1;

                let d = document.querySelector('div.vote[data-id="' + cardId + '"]');
                let thumbUp = document.querySelector('i.fa-thumbs-up[data-id="' + cardId + '"]');

                // disable voting for that card
                thumbUp.style.pointerEvents = "none";
                thumbUp.parentElement.style.opacity = 0.5;
                thumbUp.parentElement.style.cursor = "not-allowed";

                let eraser = document.createElement('i');
                eraser.classList.add('fas', 'fa-eraser', 'fa-white');
                eraser.setAttribute("data-id", cardId);
                d.insertBefore(eraser, thumbUp.parentElement); // before span

                if (!response.active) {
                    let cards = response.cards;
                    cards.forEach((card) => {
                        let id = card.id;
                        let thumbUp = document.querySelector('i.fa-thumbs-up[data-id="' + id + '"]');
                        // block voting in the board (all votes have been distributed by user)
                        thumbUp.style.pointerEvents = "none";
                        thumbUp.parentElement.style.opacity = 0.5;
                        thumbUp.parentElement.style.cursor = "not-allowed";
                    })
                }
            }
        });
    });

    $("#greenList, #redList, #blueList").on("click", ".fa-eraser", function (event) {
        event.stopPropagation();
        var cardId = $(this).data('id');

        $.ajax({
            url: '/vote-down/' + cardId,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST',
            success: function (response) {
                let p = document.querySelectorAll('div.vote[data-id="' + cardId + '"] > p')[0];
                let currentNumberOfVotes = p.innerHTML;
                p.innerHTML = parseInt(currentNumberOfVotes, 10) - 1;

                let eraser = document.querySelector('i.fa-eraser[data-id="' + cardId + '"]');
                eraser.remove();
                let cards = response.cards;
                cards.forEach((card) => {
                    let id = card.id;
                    let thumbUp = document.querySelector('i.fa-thumbs-up[data-id="' + id + '"]');
                    // enable voting
                    thumbUp.style.pointerEvents = "auto";
                    thumbUp.parentElement.style.opacity = 1;
                    thumbUp.parentElement.style.cursor = "pointer";
                })
            }
        });
    });
})