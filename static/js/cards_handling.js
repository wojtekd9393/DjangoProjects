$(document).ready(function () {
    // csrf token
    var csrfToken = $("input[name=csrfmiddlewaretoken]").val();

    // enum with cards colors (Bootstrap classes)
    const cardColor = {
        green: 'bg-success',
        red: 'bg-danger',
        blue: 'bg-primary'
    };

    // card delete modal dialog's handlers
    const cardDeleteModal = document.getElementById("modal-delete");
    const cardDeleteConfirmBtn = document.querySelector("#modal-delete button.btn-primary");
    const cardDeleteRejectBtn = document.querySelector("#modal-delete button.btn-secondary");

    // cards delete buttons
    let deleteBtns = document.querySelectorAll("i.fa-trash-alt");

    deleteBtns.forEach(btn => {
        let id = btn.getAttribute("data-id");
        addModalDialogListeners(id);
    });

    // cards merge modal dialog's handlers
    const cardsMergeModal = document.getElementById("modal-merge");
    const cardsMergeConfirmBtn = document.querySelector("#modal-merge button.btn-primary");
    const cardsMergeRejectBtn = document.querySelector("#modal-merge button.btn-secondary");

    // draggable items (cards)
    const items = document.querySelectorAll('div[draggable="true"]');

    items.forEach(item => {
        let id = item.getAttribute("data-id");
        addDraggableListeners(id);
    });

    // element which is being currently dragged
    let dragItem = null;
    let ghostElem = null;
    // the element on which dragged element is dropped
    let droppedArea = null;

    cardsMergeRejectBtn.addEventListener("click", (e) => {
        cardsMergeModal.close();
        let draggedId = e.target.getAttribute('data-dragged-id');
        const item = document.querySelector('div > div.card[data-id="' + draggedId + '"]');
        item.setAttribute('data-dropped', "false");
        item.classList.remove('hidden');
        droppedArea.classList.remove('drag-over');
        droppedArea = null;
    });

    // cards sorting - opening and closing the dropdown menu for Sort button
    let sortBtn = document.getElementsByClassName('sort-cards-btn')[0];
    sortBtn.addEventListener('click', toggleSortDropdownMenu);

    // counters
    var cardAddCounter = 0;
    var cardEditCounter = 0;

    // adding new cards
    $("a.add-temp-card").on("click", function () {
        let category = parseInt($(this).attr("data-category"));
        cardAddCounter += 1;

        // assign id to each newly created div containing the form
        let tempCardId = "temp-card-" + cardAddCounter;

        let form = `
            <div id="${tempCardId}" class="temp-card clearfix">
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

        // adding new card to correct column based on its category
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
        $('div#' + tempCardId + ' form > textarea').focus();

        // ADD CARD BUTTON
        let createButton = document.querySelector('div#' + tempCardId + ' button.add-card');
        createButton.addEventListener("click", () => {
            let tempCardDiv = createButton.parentElement.parentElement.parentElement;
            let taValue = $('div#' + tempCardId + ' form > textarea')[0].value.trim();

            // add new card only if the card's content is not an empty string
            if (taValue !== "") {
                let serializedData = $('div#' + tempCardId + ' form').serialize();
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
                                let greenCard = createCard(id, body, cardColor.green);
                                $("#greenList").append(greenCard);
                                break;
                            case 2:
                                let redCard = createCard(id, body, cardColor.red);
                                $("#redList").append(redCard);
                                break;
                            case 3:
                                let blueCard = createCard(id, body, cardColor.blue);
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
                        $(tempCardDiv).remove();
                    }
                })
            } else {
                // remove empty card
                $(tempCardDiv).remove();
            }
        });

        // REJECT CARD BUTTON
        let rejectButton = document.querySelector('div#' + tempCardId + ' a.reject-card');
        rejectButton.addEventListener("click", () => {
            let tempCardDiv = rejectButton.parentElement.parentElement.parentElement;
            // remove temp card
            $(tempCardDiv).remove();
        });
    })

    // building new card
    function createCard(id, body, color) {
        // main card div
        let card = document.createElement('div');
        card.classList.add('card', 'text-white', color, 'mb-3');
        card.setAttribute('data-id', id);
        card.setAttribute('data-dropped', 'false');
        card.setAttribute('draggable', 'true');

        // row 1
        let row1 = document.createElement('div');
        row1.classList.add('row', 'm-0');
        // card body
        let cardBody = document.createElement('div');
        cardBody.classList.add('card-body', 'col-card-content', 'ps-3', 'pe-1');
        // paragraph with card text
        let cardText = `<p class="pre-line" data-id=${id}>${body}</p>`;
        $(cardBody).append(cardText);
        // settings
        let settings = document.createElement('div');
        settings.classList.add('col-settings', 'text-center', 'p-1');
        // icon
        let settingsIcon = `<i class="fas fa-ellipsis-v" data-bs-toggle="dropdown" aria-expanded="false"></i>`;
        $(settings).append(settingsIcon);
        // dropdown menu
        let dropdownMenu = document.createElement('ul');
        dropdownMenu.classList.add('dropdown-menu', 'py-1');
        let item1 = `<li><a draggable="false" class="dropdown-item" href="#"><i class="far fa-object-ungroup"></i> Unmerge card</a></li>`;
        let item2 = `<li><a draggable="false" class="dropdown-item" href="#"><i class="far fa-file-alt"></i> Copy card text</a></li>`;
        $(dropdownMenu).append(item1);
        $(dropdownMenu).append(item2);
        settings.appendChild(dropdownMenu);
        row1.appendChild(cardBody);
        row1.appendChild(settings);

        // row2
        let row2 = document.createElement('div');
        row2.classList.add('row', 'm-0', 'px-1', 'pb-2');
        let actions = document.createElement('div');
        actions.classList.add('actions', 'text-end', 'px-1', 'mt-1');
        let edit = `<i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i>`;
        let trash = `<i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i>`;
        $(actions).append(edit);
        $(actions).append(trash);
        row2.appendChild(actions);

        // main card consisting of 2 rows
        card.appendChild(row1);
        card.appendChild(row2);

        return card;
    }

    // editing cards
    $("#main-div").on("click", "div.actions > i.fa-edit", function (event) {
        cardEditCounter++;
        let tempEditId = "temp-edit-" + cardEditCounter;
        let cardDiv = event.target.parentElement.parentElement.parentElement;
        let id = cardDiv.getAttribute("data-id");

        $.ajax({
            url: '/edit/' + id,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'GET',
            success: function (response) {
                let card = response.card;
                let form = `
                    <div id="${tempEditId}" class="temp-card clearfix">
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
                $(cardDiv).replaceWith(form);

                // set the initial height of text area depending on its scroll height
                let ta = document.querySelector('div#' + tempEditId + ' textarea');
                ta.style.height = ta.scrollHeight + 'px';

                $(ta).focus();

                // EDIT CARD BUTTON
                let editButton = document.querySelector('div#' + tempEditId + ' button.add-card');
                editButton.addEventListener("click", () => {
                    let serializedData = $('div#' + tempEditId + ' form').serialize();
                    serializedData += "&csrfmiddlewaretoken=";
                    serializedData += csrfToken;

                    $.ajax({
                        url: '/edit/' + id,
                        data: serializedData,
                        method: 'POST',
                        success: function (response) {
                            // update the card body (paragraph element)
                            cardDiv.children[0].children[0].children[0].innerHTML = response.card.body;
                            let editForm = editButton.parentElement.parentElement.parentElement;
                            // replace form with card containing edited content
                            $(editForm).replaceWith(cardDiv);
                        }
                    })
                })

                // REJECT CARD BUTTON
                let rejectButton = document.querySelector('div#' + tempEditId + ' a.reject-card');
                rejectButton.addEventListener("click", () => {
                    let editForm = rejectButton.parentElement.parentElement.parentElement;
                    // restore original card by replacing the form
                    $(editForm).replaceWith(cardDiv);
                });
            }
        })
    });

    // deleting card
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
                cardDeleteModal.close();
                $('div.card[data-id="' + dataId + '"]').remove();
            }
        });
    });

    function addModalDialogListeners(id) {
        let btn = $("i.fa-trash-alt[data-id=" + id + "]")[0];
        btn.addEventListener("click", () => {
            cardDeleteConfirmBtn.setAttribute("data-id", id);
            cardDeleteModal.showModal();
        });

        cardDeleteRejectBtn.addEventListener("click", () => {
            cardDeleteModal.close();
        });
    }

    function addDraggableListeners(id) {
        const item = document.querySelector('div.card[data-id="' + id + '"]');

        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragenter', dragEnter)
        item.addEventListener('dragover', dragOver);
        item.addEventListener('dragleave', dragLeave);
        item.addEventListener('drop', drop);
        item.addEventListener('dragend', dragEnd);
    }

    // drag & drop functions
    function dragStart(e) {
        // if(e.target.classList.contains("dropdown-menu")) e.preventDefault();
        if(e.target.nodeName == "a") e.preventDefault();
        console.log(e.target.nodeName);
        const id = e.target.getAttribute("data-id");
        dragItem = this;
        ghostElem = this;
        e.dataTransfer.setData('text/plain', id);
        // setting the properties of "ghost" element when dragging
        // TODO: change the style of that ghost element because now it is bad visible
        e.dataTransfer.setDragImage(ghostElem, 150, 50);
        setTimeout(() => {
            e.target.classList.add('hidden');
        }, 0);
    }

    function dragEnter(e) {
        e.preventDefault();
        let item = e.target.closest('div.card[draggable="true"]');
        item.classList.add('drag-over');
    }

    function dragOver(e) {
        // TODO: dragging over the form input is allowed but it shouldn't be
        e.preventDefault();
        let item = e.target.closest('div.card[draggable="true"]');
        item.classList.add('drag-over');
    }

    function dragLeave(e) {
        let item = e.target.closest('div.card[draggable="true"]');
        item.classList.remove('drag-over');
    }

    function drop(e) {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const item = document.querySelector('div > div.card[data-id="' + draggedId + '"]');

        item.setAttribute('data-dropped', "true");
        droppedArea = e.target.closest('div.card[draggable="true"]');

        let destId = droppedArea.getAttribute("data-id");

        // show merge confirmation modal
        cardsMergeConfirmBtn.setAttribute("data-dragged-id", draggedId);
        cardsMergeConfirmBtn.setAttribute("data-dest-id", destId);
        cardsMergeRejectBtn.setAttribute("data-dragged-id", draggedId);
        cardsMergeModal.showModal();
    }

    function dragEnd() {
        let dropped = dragItem.getAttribute("data-dropped");

        if (dropped == "false") {
            dragItem.classList.remove('hidden');
        }
        dragItem = null;
    }

    // merging cards
    $("#modal-merge button.btn-primary").on('click', function (event) {
        event.stopPropagation();
        let draggedId = $(this).attr('data-dragged-id');
        let destId = $(this).attr('data-dest-id');

        $.ajax({
            url: '/merge/' + draggedId + '/' + destId,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST',
            success: function (response) {
                let destCard = document.querySelector('div.card p.pre-line[data-id="' + destId + '"]');
                destCard.innerHTML = response.new_body;

                const item = document.querySelector('div > div.card[data-id="' + draggedId + '"]');
                cardsMergeModal.close();
                $(item).remove();
                droppedArea.classList.remove('drag-over');
                droppedArea = null;
            }
        });
    });

    // cards sorting
    function toggleSortDropdownMenu() {
        document.getElementById("myDropdown").classList.toggle("show");
    }

    window.onclick = function (event) {
        if (!event.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content-sort");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }
});