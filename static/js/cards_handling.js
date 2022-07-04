$(document).ready(function() {
    var csrfToken = $("input[name=csrfmiddlewaretoken]").val();

    $("#createButton1").click(function() {
        var serializedData = $("#form1").serialize();

        $.ajax({
            url: window.location.href,
            data: serializedData,
            method: 'POST',
            success: function(response) {
                let category = response.task.category;
                let id = response.task.id;
                let item = response.task.item;
                switch(category) {
                case 1:
                    let greenCard = `
                        <div class="card text-white bg-success mb-3" id="greenCard" data-id=${id}><div class="card-body"><p>${item}</p><div class="actions"><a href="/edit/${id}"><i class="fas fa-edit fa-white"></i></a> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete item"></i></div></div></div>
                    `;
                    $("#greenList").prepend(greenCard)
                    break;
                case 2:
                    let redCard = `
                        <div class="card text-white bg-danger mb-3" id="redCard" data-id=${id}><div class="card-body"><p>${item}</p><div class="actions"><a href="/edit/${id}"><i class="fas fa-edit fa-white"></i></a> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete item"></i></div></div></div>
                    `;
                    $("#redList").prepend(redCard)
                    break;
                case 3:
                    let blueCard = `
                        <div class="card text-white bg-primary mb-3" id="blueCard" data-id=${id}><div class="card-body"><p>${item}</p><div class="actions"><a href="/edit/${id}"><i class="fas fa-edit fa-white"></i></a> <i class="fas fa-trash-alt fa-white" data-id=${id} data-toggle="tooltip" data-placement="bottom" title="Delete item"></i></div></div></div>
                    `;
                    $("#blueList").prepend(blueCard)
                    break;
                default:
                    console.log("Wrong category: " + category);
                }
                $("#exampleModal .close").click();
            }
        })

        $("#form1")[0].reset();
    });

//    list = document.getElementById("greenList");
//    list.onclick = function(event) {
//        //event.stopPropagation(); // co to robi w tym przypadku?
//        let i = event.target.closest('.card .fa-trash-alt');
//        // param of closest = The closest ancestor Element or itself, which matches the selectors.
//        // If there are no such element, null.
//        if(!i) return;
//        var dataId = i.getAttribute("data-id");
//
//        $.ajax({
//            url: '/delete/item/' + dataId,
//            data: {
//                csrfmiddlewaretoken: csrfToken,
//                id: dataId // działa bez tego, czy jest potrzebne?
//            },
//            type: 'post',
//            success: function() {
//                $('#greenCard[data-id="' + dataId + '"]').remove();
//            }
//        });
//        }

    $("#greenList").on('click', '.card .fa-trash-alt', function(event) {
        event.stopPropagation();
        var dataId = $(this).data('id');

        $.ajax({
            url: '/delete/item/' + dataId,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST',
            success: function() {
                $('#greenCard[data-id="' + dataId + '"]').remove();
            }
        });
    });

    $("#redList").on('click', '.card .fa-trash-alt', function(event) {
        event.stopPropagation();
        var dataId = $(this).data('id');

        $.ajax({
            url: '/delete/item/' + dataId,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST',
            success: function() {
                $('#redCard[data-id="' + dataId + '"]').remove();
            }
        });

    });

    $("#blueList").on('click', '.card .fa-trash-alt', function(event) {
        event.stopPropagation();
        var dataId = $(this).data('id');

        $.ajax({
            url: '/delete/item/' + dataId,
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            method: 'POST',
            success: function() {
                $('#blueCard[data-id="' + dataId + '"]').remove();
            }
        });
    });

});