$(document).ready(function() {

    var csrfToken = $("input[name=csrfmiddlewaretoken]").val();
    var counter = 0;

    $("a.add-temp-card").each(function(index) {
        $(this).on("click", function(event) {
            let category = parseInt($(this).attr("data-category"));
            let author = $(this).attr("data-author");

            counter += 1;
            // assign id to each newly created div containing the form
            let temp_card_id = "temp-card-" + counter;

            let form = `
                <div id="${temp_card_id}" class="temp-card clearfix">
                  <form method="post">
                      <textarea class="form-control" rows=1 placeholder="Type something..." name="body" required oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"></textarea>
                      <input class="form-control mr-sm-2 add_card" type="hidden" aria-label="Search", size="30" name="category" value=${category}>
                      <input class="form-control mr-sm-2 add_card" type="hidden" aria-label="Search", size="30" name="author" value=${author}>
                      <div class="temp-card-actions">
                          <a class="btn btn-sm btn-danger reject-card"><i class="fas fa-times"></i></a>
                          <button class="btn btn-sm btn-primary add-card" type="button">Add Card</button>
                      </div>
                  </form>
                </div>
            `;

            switch(category) {
                case 1:
                    $("#greenList").prepend(form);
                    break;
                case 2:
                    $("#redList").prepend(form);
                    break;
                case 3:
                    $("#blueList").prepend(form);
                    break;
                default:
                    console.log("Wrong card category: " + category);
            }

            // ADD CARD BUTTON
            let createButton = document.querySelector('div#'+temp_card_id+' button.add-card');
            createButton.addEventListener("click", (event) => {
                var temp_card_id = "temp-card-" + event.currentTarget.getAttribute("data-counter");
                var ta_value = $('div#'+temp_card_id+' form > textarea')[0].value.trim();

                // add new card only if the card's content is not an empty string
                if(ta_value !== "") {
                    var serializedData = $('div#' + temp_card_id + ' form').serialize();
                    serializedData += "&csrfmiddlewaretoken=";
                    serializedData += csrfToken;

                    $.ajax({
                        url: window.location.href,
                        data: serializedData,
                        method: 'POST',
                        success: function(response) {
                            let category = response.card.category;
                            let id = response.card.id;
                            let body = response.card.body;

                            switch(category) {
                                case 1:
                                    let greenCard = `
                                        <div class="card text-white bg-success mb-3" id="greenCard" data-id=${id}><div class="card-body"><p class="pre-line">${body}</p><div class="actions"><a href="/edit/${id}"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i></a> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                                    `;
                                    $("#greenList").append(greenCard);
                                    break;
                                case 2:
                                    let redCard = `
                                        <div class="card text-white bg-danger mb-3" id="redCard" data-id=${id}><div class="card-body"><p class="pre-line">${body}</p><div class="actions"><a href="/edit/${id}"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i></a> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                                    `;
                                    $("#redList").append(redCard);
                                    break;
                                case 3:
                                    let blueCard = `
                                        <div class="card text-white bg-primary mb-3" id="blueCard" data-id=${id}><div class="card-body"><p class="pre-line">${body}</p><div class="actions"><a href="/edit/${id}"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i></a> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                                    `;
                                    $("#blueList").append(blueCard);
                                    break;
                                default:
                                    console.log("Wrong card category: " + category);
                            }
                            addModalDialogListeners(id);

                            $('div#' + temp_card_id).remove();
                        }
                    })
                } else {
                    // remove empty card
                    $('div#' + temp_card_id).remove();
                }
            });

            // keep the current counter value
            createButton.setAttribute("data-counter", counter);

            // REJECT CARD BUTTON
            let rejectButton = document.querySelector('div#'+temp_card_id+' a.reject-card');
            rejectButton.addEventListener("click", (event) => {
                var temp_card_id = "temp-card-" + event.currentTarget.getAttribute("data-counter");
                $('div#' + temp_card_id).remove();
            });

            // keep the current counter value
            rejectButton.setAttribute("data-counter", counter);
        })
    })

    $("#modal-delete button.btn-primary").on('click', function(event) {
        // event.target.closest('.card .fa-trash-alt');
        event.stopPropagation();
        var dataId = $(this).attr('data-id');

        $.ajax({
            url: '/delete/card/' + dataId,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST',
            success: function() {
                const modal = document.getElementById("modal-delete");
                modal.close();
                $('div.card[data-id="' + dataId + '"]').remove();
            }
        });
    });

    function addModalDialogListeners(id) {
        const modal = document.getElementById("modal-delete");
        const modal_btn_primary = document.querySelector("#modal-delete button.btn-primary");
        const modal_btn_secondary = document.querySelector("#modal-delete button.btn-secondary");

        let btn = $("i.fa-trash-alt[data-id="+id+"]")[0];
        btn.addEventListener("click", () => {
            modal_btn_primary.setAttribute("data-id", id);
            modal.showModal();
        });

        modal_btn_secondary.addEventListener("click", () => {
            modal.close();
        });
    }
});