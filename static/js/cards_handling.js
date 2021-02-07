$(document).ready(function(){

    var csrfToken = $("input[name=csrfmiddlewaretoken]").val();

    $("#createButton1").click(function() {
        var serializedData = $("#form1").serialize();

        $.ajax({
            url: window.location.href,
            data: serializedData,
            type: 'POST',
            success: function(response) {
                $("#greenList").prepend('<div class="card text-white bg-success mb-3" id="greenCard" data-id="' + response.task.id + '"><div class="card-body"><p>'+response.task.item+'</p><div class="actions"><a href="/edit/'+response.task.id+'"><i class="fas fa-edit fa-white"></i></a> <i class="fas fa-trash-alt fa-white" data-id="' + response.task.id + '" data-toggle="tooltip" data-placement="bottom" title="Delete item"></i></div></div></div>')
                $("#exampleModal .close").click();
            }
        })

        $("#form1")[0].reset();
    });

    $("#greenList").on('click', '.card', function() {
        var dataId = $(this).data('id');

                var cardItem = $('#greenCard[data-id="' + dataId + '"]');

    }).on('click', '.fa-trash-alt', function(event) {
        event.stopPropagation();

        var dataId = $(this).data('id');

        $.ajax({
            url: '/delete/item/' + dataId,
            data: {
                csrfmiddlewaretoken: csrfToken,
                id: dataId
            },
            type: 'post',
            success: function() {
                $('#greenCard[data-id="' + dataId + '"]').remove();
            }
        });

    });

    $("#createButton2").click(function() {
        var serializedData = $("#form2").serialize();

        $.ajax({
            url: window.location.href,
            data: serializedData,
            type: 'POST',
            success: function(response) {
                $("#redList").prepend('<div class="card text-white bg-danger mb-3" id="redCard" data-id="' + response.task.id + '"><div class="card-body"><p>'+response.task.item+'</p><div class="actions"><a href="/edit/'+response.task.id+'"><i class="fas fa-edit fa-white"></i></a> <i class="fas fa-trash-alt fa-white" data-id="' + response.task.id + '" data-toggle="tooltip" data-placement="bottom" title="Delete item"></i></div></div></div>')
                $("#exampleModal2 .close").click();
            }
        })

        $("#form2")[0].reset();
    });

    $("#redList").on('click', '.card', function() {
        var dataId = $(this).data('id');

                var cardItem = $('#redCard[data-id="' + dataId + '"]');

    }).on('click', '.fa-trash-alt', function(event) {
        event.stopPropagation();

        var dataId = $(this).data('id');

        $.ajax({
            url: '/delete/item/' + dataId,
            data: {
                csrfmiddlewaretoken: csrfToken,
                id: dataId
            },
            type: 'post',
            success: function() {
                $('#redCard[data-id="' + dataId + '"]').remove();
            }
        });

    });

    $("#createButton3").click(function() {
    var serializedData = $("#form3").serialize();

        $.ajax({
            url: window.location.href,
            data: serializedData,
            type: 'POST',
            success: function(response) {
                $("#blueList").prepend('<div class="card text-white bg-primary mb-3" id="blueCard" data-id="' + response.task.id + '"><div class="card-body"><p>'+response.task.item+'</p><div class="actions"><a href="/edit/'+response.task.id+'"><i class="fas fa-edit fa-white"></i></a> <i class="fas fa-trash-alt fa-white" data-id="' + response.task.id + '" data-toggle="tooltip" data-placement="bottom" title="Delete item"></i></div></div></div>')
                $("#exampleModal3 .close").click();
            }
        })

        $("#form3")[0].reset();
    });

    $("#blueList").on('click', '.card', function() {
        var dataId = $(this).data('id');

                var cardItem = $('#blueCard[data-id="' + dataId + '"]');
                // cardItem.hide().slideDown();
                // $("#blueList").append(cardItem);
<!--                cardItem.toggleClass("bg-danger");-->
<!--                cardItem.removeClass("bg-primary");-->
<!--                cardItem.addClass("bg-danger");-->

<!--                cardItem.css('font-size', '200%');-->
<!--                $("#blueList").append(cardItem);-->


    }).on('click', '.fa-trash-alt', function(event) {
        event.stopPropagation();

        var dataId = $(this).data('id');

        $.ajax({
            url: '/delete/item/' + dataId,
            data: {
                csrfmiddlewaretoken: csrfToken,
                id: dataId
            },
            type: 'post',
            success: function() {
                $('#blueCard[data-id="' + dataId + '"]').remove();
            }
        });

    });

});