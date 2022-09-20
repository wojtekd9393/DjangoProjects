var csrfToken = $("input[name=csrfmiddlewaretoken]").val();

const items = document.querySelectorAll('div[draggable="true"]');
// element which is being currently dragged
let dragItem = null;

items.forEach(item => {
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragenter', dragEnter)
    item.addEventListener('dragover', dragOver);
    item.addEventListener('dragleave', dragLeave);
    item.addEventListener('drop', drop);
    item.addEventListener('dragend', dragEnd);
});

function dragStart(e) {
    const id = e.target.getAttribute("data-id");
    dragItem = this;
    e.dataTransfer.setData('text/plain', id);
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
    const dragged_id = e.dataTransfer.getData('text/plain');
    const item = document.querySelector('div > div.card[data-id="' + dragged_id + '"]');

    item.classList.remove('drag-over');
    item.setAttribute('data-dropped', "true");

    let el = e.target.closest('p.pre-line');
    if (el == null) {
        el = e.target.querySelector('p.pre-line');
    }

    let dest_id = el.getAttribute("data-id");

    // show merge confirmation modal
    merge_modal_btn_primary.setAttribute("data-dragged-id", dragged_id);
    merge_modal_btn_primary.setAttribute("data-dest-id", dest_id);
    merge_modal_btn_secondary.setAttribute("data-dragged-id", dragged_id);
    merge_modal.showModal();
}

function dragEnd() {
    let dropped = dragItem.getAttribute("data-dropped");

    if (dropped == "false") {
        dragItem.classList.remove('hidden');
    }
    dragItem = null;
}

// merge modal handling
const merge_modal = document.getElementById("modal-merge");
const merge_modal_btn_primary = document.querySelector("#modal-merge button.btn-primary");
const merge_modal_btn_secondary = document.querySelector("#modal-merge button.btn-secondary");

merge_modal_btn_secondary.addEventListener("click", (e) => {
    merge_modal.close();
    let dragged_id = e.target.getAttribute('data-dragged-id');
    const item = document.querySelector('div > div.card[data-id="' + dragged_id + '"]');
    item.setAttribute('data-dropped', "false");
    item.classList.remove('hidden');
});

$("#modal-merge button.btn-primary").on('click', function (event) {
    event.stopPropagation();
    let dragged_id = $(this).attr('data-dragged-id');
    let dest_id = $(this).attr('data-dest-id');

    $.ajax({
        url: '/merge/' + dragged_id + '/' + dest_id,
        data: {
            csrfmiddlewaretoken: csrfToken
        },
        method: 'POST',
        success: function (response) {
            let dest_card = document.querySelector('div.card p.pre-line[data-id="' + dest_id + '"]');
            dest_card.innerHTML = response.new_body;

            const item = document.querySelector('div > div.card[data-id="' + dragged_id + '"]');
            merge_modal.close();
            $(item).remove();
        }
    });
});