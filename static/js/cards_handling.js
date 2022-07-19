$(document).ready(function() {
    var csrfToken = $("input[name=csrfmiddlewaretoken]").val();

    $("#createButton").click(function() {
        var serializedData = $("#form").serialize();

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
                        <div class="card text-white bg-success mb-3" id="greenCard" data-id=${id}><div class="card-body"><p>${body}</p><div class="actions"><a href="/edit/${id}"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i></a> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                    `;
                    $("#greenList").prepend(greenCard);
                    addModalDialogListeners(id);
                    break;
                case 2:
                    let redCard = `
                        <div class="card text-white bg-danger mb-3" id="redCard" data-id=${id}><div class="card-body"><p>${body}</p><div class="actions"><a href="/edit/${id}"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i></a> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                    `;
                    $("#redList").prepend(redCard);
                    addModalDialogListeners(id);
                    break;
                case 3:
                    let blueCard = `
                        <div class="card text-white bg-primary mb-3" id="blueCard" data-id=${id}><div class="card-body"><p>${body}</p><div class="actions"><a href="/edit/${id}"><i class="fas fa-edit fa-white" data-toggle="tooltip" title="Edit card"></i></a> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete card"></i></div></div></div>
                    `;
                    $("#blueList").prepend(blueCard);
                    addModalDialogListeners(id);
                    break;
                default:
                    console.log("Wrong category: " + category);
                }
                $("#exampleModal .close").click();
            }
        })

        $("#form")[0].reset();
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