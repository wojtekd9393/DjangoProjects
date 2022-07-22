$(document).ready(function() {

    var csrfToken = $("input[name=csrfmiddlewaretoken]").val();
    var counter = 0; // add card counter
    var counter2 = 0; // edit card counter

    $("a.add-temp-card").each(function(index) {
        $(this).on("click", function(event) {
            let category = parseInt($(this).attr("data-category"));
            counter += 1;

            // assign id to each newly created div containing the form
            let temp_card_id = "temp-card-" + counter;

            let form = `
                <div id="${temp_card_id}" class="temp-card clearfix">
                  <form method="post">
                      <textarea class="form-control" rows=1 placeholder="Type something..." name="body" required oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"></textarea>
                      <input class="form-control mr-sm-2 add_card" type="hidden" aria-label="Search", size="30" name="category" value=${category}>
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

            // focus on the textarea belonging to the lately added card
            $('div#' + temp_card_id + ' form > textarea').focus();

            // ADD CARD BUTTON
            let createButton = document.querySelector('div#' + temp_card_id + ' button.add-card');
            createButton.addEventListener("click", (event) => {
                var temp_card_id = "temp-card-" + event.currentTarget.getAttribute("data-counter");
                var ta_value = $('div#' + temp_card_id + ' form > textarea')[0].value.trim();

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
                                        <div class="card text-white bg-success mb-3" id="greenCard" data-id=${id}><div class="card-body"><p class="pre-line">${body}</p><div class="actions"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                                    `;
                                    $("#greenList").append(greenCard);
                                    break;
                                case 2:
                                    let redCard = `
                                        <div class="card text-white bg-danger mb-3" id="redCard" data-id=${id}><div class="card-body"><p class="pre-line">${body}</p><div class="actions"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                                    `;
                                    $("#redList").append(redCard);
                                    break;
                                case 3:
                                    let blueCard = `
                                        <div class="card text-white bg-primary mb-3" id="blueCard" data-id=${id}><div class="card-body"><p class="pre-line">${body}</p><div class="actions"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
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
            let rejectButton = document.querySelector('div#' + temp_card_id + ' a.reject-card');
            rejectButton.addEventListener("click", (event) => {
                var temp_card_id = "temp-card-" + event.currentTarget.getAttribute("data-counter");
                $('div#' + temp_card_id).remove();
            });

            // keep the current counter value
            rejectButton.setAttribute("data-counter", counter);
        })
    })

    $("#main-div").on("click", "div.actions > i.fa-edit", function(event) {
        counter2++;
        let temp_edit_id = "temp-edit-" + counter2;
        var card_div = event.target.parentElement.parentElement.parentElement;
        var id = card_div.getAttribute("data-id");

        $.ajax({
            url: '/edit/' + id,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'GET',
            success: function(response) {
                let card = response.card;
                let form = `
                    <div id="${temp_edit_id}" class="temp-card clearfix">
                      <form method="post">
                          <textarea class="form-control" placeholder="Type something..." name="body" required oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'" onfocus="this.setSelectionRange(this.value.length,this.value.length);">${card.body}</textarea>
                          <input class="form-control mr-sm-2 add_card" type="hidden" aria-label="Search", size="30" name="category" value=${card.category}>
                          <div class="temp-card-actions">
                              <a class="btn btn-sm btn-danger reject-card"><i class="fas fa-times"></i></a>
                              <button class="btn btn-sm btn-primary add-card" type="button">Edit Card</button>
                          </div>
                      </form>
                    </div>
                `;

                $(card_div).replaceWith(form);

                // set the initial height of text area depending on its number of lines and padding
                let ta = document.querySelector('div#' + temp_edit_id + ' textarea');
                let lines = ta.value.split("\n").length;
                ta.style.height = lines * 24 + 12 + 'px'; // 24 - line height, 12 - padding (2 x 6)

                $(ta).focus();

                let editButton = document.querySelector('div#' + temp_edit_id + ' button.add-card');
                editButton.addEventListener("click", (event) => {
                    var serializedData = $('div#' + temp_edit_id + ' form').serialize();
                    serializedData += "&csrfmiddlewaretoken=";
                    serializedData += csrfToken;

                    $.ajax({
                        url: '/edit/' + id,
                        data: serializedData,
                        method: 'POST',
                        success: function(response) {
                            let new_div = card_div;
                            new_div.children[0].children[0].innerHTML = response.card.body;
                            let edit_form = editButton.parentElement.parentElement.parentElement;
                            $(edit_form).replaceWith(new_div);
                        }
                    })
                })

                let rejectButton = document.querySelector('div#' + temp_edit_id + ' a.reject-card');
                rejectButton.addEventListener("click", (event) => {
                    let edit_form = rejectButton.parentElement.parentElement.parentElement;
                    $(edit_form).replaceWith(card_div);
                });
            }
        })
    });

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