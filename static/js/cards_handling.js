$(document).ready(function () {

    const card_delete_modal = document.getElementById("modal-delete");
    const card_delete_confirm_btn = document.querySelector("#modal-delete button.btn-primary");
    const card_delete_reject_btn = document.querySelector("#modal-delete button.btn-secondary");

    var csrfToken = $("input[name=csrfmiddlewaretoken]").val();
    var add_counter = 0;
    var edit_counter = 0;

    $("a.add-temp-card").on("click", function () {
        let category = parseInt($(this).attr("data-category"));
        add_counter += 1;

        // assign id to each newly created div containing the form
        let temp_card_id = "temp-card-" + add_counter;

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

        switch (category) {
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
        createButton.addEventListener("click", () => {
            let temp_card_div = createButton.parentElement.parentElement.parentElement;
            let ta_value = $('div#' + temp_card_id + ' form > textarea')[0].value.trim();

            // add new card only if the card's content is not an empty string
            if (ta_value !== "") {
                let serializedData = $('div#' + temp_card_id + ' form').serialize();
                serializedData += "&csrfmiddlewaretoken=";
                serializedData += csrfToken;

                $.ajax({
                    url: window.location.href,
                    data: serializedData,
                    method: 'POST',
                    success: function (response) {
                        let category = response.card.category;
                        let id = response.card.id;
                        let body = response.card.body;

                        switch (category) {
                            case 1:
                                let greenCard = `
                                    <div class="card text-white bg-success mb-3" data-id=${id} data-dropped="false" draggable="true"><div class="card-body"><p class="pre-line" data-id=${id}>${body}</p><div class="actions"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                                `;
                                $("#greenList").append(greenCard);
                                break;
                            case 2:
                                let redCard = `
                                    <div class="card text-white bg-danger mb-3" data-id=${id} data-dropped="false" draggable="true"><div class="card-body"><p class="pre-line" data-id=${id}>${body}</p><div class="actions"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                                `;
                                $("#redList").append(redCard);
                                break;
                            case 3:
                                let blueCard = `
                                    <div class="card text-white bg-primary mb-3" data-id=${id} data-dropped="false" draggable="true"><div class="card-body"><p class="pre-line" data-id=${id}>${body}</p><div class="actions"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                                `;
                                $("#blueList").append(blueCard);
                                break;
                            default:
                                console.log("Wrong card category: " + category);
                        }
                        // add delete modal dialog events
                        addModalDialogListeners(id);

                        // add draggable listeners
                        addDraggableListeners(id);

                        // remove temp card
                        $(temp_card_div).remove();
                    }
                })
            } else {
                // remove empty card
                $(temp_card_div).remove();
            }
        });

        // REJECT CARD BUTTON
        let rejectButton = document.querySelector('div#' + temp_card_id + ' a.reject-card');
        rejectButton.addEventListener("click", () => {
            let temp_card_div = rejectButton.parentElement.parentElement.parentElement;
            // remove temp card
            $(temp_card_div).remove();
        });
    })

    $("#main-div").on("click", "div.actions > i.fa-edit", function (event) {
        edit_counter++;
        let temp_edit_id = "temp-edit-" + edit_counter;
        let card_div = event.target.parentElement.parentElement.parentElement;
        let id = card_div.getAttribute("data-id");

        $.ajax({
            url: '/edit/' + id,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'GET',
            success: function (response) {
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

                // replace card with form
                $(card_div).replaceWith(form);

                // set the initial height of text area depending on its scroll height
                let ta = document.querySelector('div#' + temp_edit_id + ' textarea');
                ta.style.height = ta.scrollHeight + 'px';

                $(ta).focus();

                // EDIT CARD BUTTON
                let editButton = document.querySelector('div#' + temp_edit_id + ' button.add-card');
                editButton.addEventListener("click", () => {
                    let serializedData = $('div#' + temp_edit_id + ' form').serialize();
                    serializedData += "&csrfmiddlewaretoken=";
                    serializedData += csrfToken;

                    $.ajax({
                        url: '/edit/' + id,
                        data: serializedData,
                        method: 'POST',
                        success: function (response) {
                            // update the card body (paragraph element)
                            card_div.children[0].children[0].innerHTML = response.card.body;
                            let edit_form = editButton.parentElement.parentElement.parentElement;
                            // replace form with card containing edited content
                            $(edit_form).replaceWith(card_div);
                        }
                    })
                })

                // REJECT CARD BUTTON
                let rejectButton = document.querySelector('div#' + temp_edit_id + ' a.reject-card');
                rejectButton.addEventListener("click", () => {
                    let edit_form = rejectButton.parentElement.parentElement.parentElement;
                    // restore original card by replacing the form
                    $(edit_form).replaceWith(card_div);
                });
            }
        })
    });

    $("#modal-delete button.btn-primary").on('click', function (event) {
        event.stopPropagation();
        let dataId = $(this).attr('data-id');

        $.ajax({
            url: '/delete/card/' + dataId,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST',
            success: function () {
                card_delete_modal.close();
                $('div.card[data-id="' + dataId + '"]').remove();
            }
        });
    });

    function addModalDialogListeners(id) {
        let btn = $("i.fa-trash-alt[data-id=" + id + "]")[0];
        btn.addEventListener("click", () => {
            card_delete_confirm_btn.setAttribute("data-id", id);
            card_delete_modal.showModal();
        });

        card_delete_reject_btn.addEventListener("click", () => {
            card_delete_modal.close();
        });
    }

    let delete_btns = document.querySelectorAll("i.fa-trash-alt");

    delete_btns.forEach(btn => {
        let id = btn.getAttribute("data-id");
        addModalDialogListeners(id);
    })

    function addDraggableListeners(id) {
        const item = document.querySelector('div.card[data-id="' + id + '"]');

        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragenter', dragEnter)
        item.addEventListener('dragover', dragOver);
        item.addEventListener('dragleave', dragLeave);
        item.addEventListener('drop', drop);
        item.addEventListener('dragend', dragEnd);
    }
});