$(document).ready(function() {
    var csrfToken = $("input[name=csrfmiddlewaretoken]").val();

    $("#greenList, #redList, #blueList").on("click", ".fa-thumbs-up", function(event) {
        event.stopPropagation();
        var cardId = $(this).data('id');

        $.ajax({
            url: '/vote/' + cardId,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST',
            success: function(response) {
                console.log(response);
                if(response.is_voted) {
                    let p = document.querySelectorAll('div.vote[data-id="' + cardId + '"] > p')[0];
                    let currentNumberOfVotes = p.innerHTML;
                    p.innerHTML = parseInt(currentNumberOfVotes, 10) + 1;

                    let d = document.querySelector('div.vote[data-id="' + cardId + '"]');
                    let thumbUp = document.querySelector('i.fa-thumbs-up[data-id="' + cardId + '"]');
                    let eraser = document.createElement('i');
                    eraser.classList.add('fas', 'fa-eraser', 'fa-white');
                    eraser.style.marginRight = "2px";
                    eraser.setAttribute("data-id", cardId);
                    d.insertBefore(eraser, thumbUp);
                }
            }
        });
    });

    $("#greenList, #redList, #blueList").on("click", ".fa-eraser", function(event) {
        event.stopPropagation();
        var cardId = $(this).data('id');

        $.ajax({
            url: '/vote-down/' + cardId,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST',
            success: function(response) {
                let p = document.querySelectorAll('div.vote[data-id="' + cardId + '"] > p')[0];
                let currentNumberOfVotes = p.innerHTML;
                p.innerHTML = parseInt(currentNumberOfVotes, 10) - 1;

                let i = document.querySelector('i.fa-eraser[data-id="' + cardId + '"]');
                i.remove();
            }
        });
    });
})