/**
 * Created by user on 16/05/2016.
 */
console.log("Pruebas unitarias - TDW");

var insertedId = -1;

// PRUEBAS DE OPTIONS /users
$.ajax({
    url: '/users',
    method: 'OPTIONS'
}).done(function (data, statusText, xhr) {
    $("#results-users").append("OPTIONS /users - EXPECTED STATUS: 200<br/>");
    if(String(xhr.status) === "200")
        $("#results-users").append("OK<br/><br/>");
    else
        $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");

    $("#results-users").append("OPTIONS /users - EXPECTED HEADER 'ALLOW': 'DELETE, GET, POST, PUT, OPTIONS'<br/>");

    if(xhr.getResponseHeader("Allow") == "DELETE, GET, POST, PUT, OPTIONS")
        $("#results-users").append("OK<br/><br/>");
    else
        $("#results-users").append("<b>NOT OK (" + xhr.getResponseHeader("Allow") + ")</b><br/><br/>");
}).fail(function (xhr, textStatus, errorThrown) {
    $("#results-users").append("OPTIONS /users - EXPECTED STATUS: 200<br/>");
    $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
});

// PRUEBAS DE OPTIONS /courts
$.ajax({
    url: '/courts',
    method: 'OPTIONS'
}).done(function (data, statusText, xhr) {
    $("#results-courts").append("OPTIONS /courts - EXPECTED STATUS: 200<br/>");
    if(String(xhr.status) === "200")
        $("#results-courts").append("OK<br/><br/>");
    else
        $("#results-courts").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");

    $("#results-courts").append("OPTIONS /courts - EXPECTED HEADER 'ALLOW': 'DELETE, GET, POST, PUT, OPTIONS'<br/>");

    if(xhr.getResponseHeader("Allow") == "DELETE, GET, POST, PUT, OPTIONS")
        $("#results-courts").append("OK<br/><br/>");
    else
        $("#results-courts").append("<b>NOT OK (" + xhr.getResponseHeader("Allow") + ")</b><br/><br/>");
}).fail(function (xhr, textStatus, errorThrown) {
    $("#results-courts").append("OPTIONS /courts - EXPECTED STATUS: 200<br/>");
    $("#results-courts").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
});

$.ajax({
    url: '/users/login',
    method: 'POST',
    data: JSON.stringify({username: 'juan', password: 'juan123'}),
    contentType: "application/json"
}).done(function (authData, statusText, xhr) {
// PRUEBAS DE GET /users
    $.ajax({
        url: '/users',
        method: 'GET',
        headers: {"X-Auth-Token": authData}
    }).done(function (data, statusText, xhr) {
        $("#results-users").append("GET /users - EXPECTED STATUS: 200<br/>");
        if (String(xhr.status) === "200") {
            $("#results-users").append("OK<br/>");
            $("#results-users").append(JSON.stringify(data));
            $("#results-users").append("<br/><br/>");
        }
        else
            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
    }).fail(function (xhr, textStatus, errorThrown) {
        $("#results-users").append("GET /users - EXPECTED STATUS: 200<br/>");
        $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
    });

    $.ajax({
        url: '/users',
        method: 'POST',
        headers: {"X-Auth-Token": authData}
    }).done(function (data, statusText, xhr) {
        $("#results-users").append("POST /users - EXPECTED STATUS: 403<br/>");
        if (String(xhr.status) === "403") {
            $("#results-users").append("OK<br/><br/>");
        }
        else
            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
    }).fail(function (xhr, textStatus, errorThrown) {
        $("#results-users").append("POST /users - EXPECTED STATUS: 403<br/>");
        if (String(xhr.status) === "403") {
            $("#results-users").append("OK<br/><br/>");
        }
        else
            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
    });
});
// PRUEBAS DE POST /users
$.ajax({
    url: '/users',
    method: 'POST',
    data: JSON.stringify({username: 'Daniel', password: 'Daniel123', enabled: 'true'}),
    contentType: "application/json"
}).done(function (data, statusText, xhr) {
    $("#results-users").append("POST /users without email nor login - EXPECTED STATUS: 401<br/>");
    if(String(xhr.status) === "401")  {
        $("#results-users").append("OK<br/><br/>");
    }
    else
        $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
}).fail(function (xhr, textStatus, errorThrown) {
    $("#results-users").append("POST /users without email nor login - EXPECTED STATUS: 401<br/>");
    if(String(xhr.status) == "401")  {
        $("#results-users").append("OK<br/><br/>");
    }
    else
        $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
});

$.ajax({
    url: '/users/login',
    method: 'POST',
    data: JSON.stringify({username: 'mateo', password: 'mateo123'}),
    contentType: "application/json"
}).done(function (authData, statusText, xhr) {

    $.ajax({
        url: '/courts',
        method: 'GET',
        headers: {"X-Auth-Token": authData}
    }).done(function (data, statusText, xhr) {

    }).fail(function (xhr, textStatus, errorThrown) {
        $("#results-courts").append("GET /courts without data - EXPECTED STATUS: 404<br/>");
        if(String(xhr.status) == "404")  {
            $("#results-courts").append("OK<br/><br/>");
        }
        else
            $("#results-courts").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
    });

    $.ajax({
        url: '/users',
        method: 'POST',
        data: JSON.stringify({username: 'Daniel', email: 'Daniel@gmail.com', enabled: 'true'}),
        contentType: "application/json",
        headers: {"X-Auth-Token": authData}
    }).done(function (data, statusText, xhr) {
        $("#results-users").append("POST /users without password - EXPECTED STATUS: 422<br/>");
        if(String(xhr.status) === "422")  {
            $("#results-users").append("OK<br/><br/>");
        }
        else
            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
    }).fail(function (xhr, textStatus, errorThrown) {
        $("#results-users").append("POST /users without password - EXPECTED STATUS: 422<br/>");
        if(String(xhr.status) == "422")  {
            $("#results-users").append("OK<br/><br/>");
        }
        else
            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
    });

    $.ajax({
        url: '/users',
        method: 'POST',
        data: JSON.stringify({password: 'Daniel123', email: 'Daniel@gmail.com', enabled: 'true'}),
        contentType: "application/json",
        headers: {"X-Auth-Token": authData}
    }).done(function (data, statusText, xhr) {
        $("#results-users").append("POST /users without username - EXPECTED STATUS: 422<br/>");
        if(String(xhr.status) === "422")  {
            $("#results-users").append("OK<br/><br/>");
        }
        else
            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
    }).fail(function (xhr, textStatus, errorThrown) {
        $("#results-users").append("POST /users without username - EXPECTED STATUS: 422<br/>");
        if(String(xhr.status) == "422")  {
            $("#results-users").append("OK<br/><br/>");
        }
        else
            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
    });

    $.ajax({
        url: '/users',
        method: 'POST',
        data: JSON.stringify({username: 'Daniel', password: 'Daniel123', email: 'daniel@gmail.com', enabled: 'true', roles: ['ROLE_ADMIN', 'ROLE_USER']}),
        contentType: "application/json",
        dataType: "json",
        headers: {"X-Auth-Token": authData}
    }).done(function (data, statusText, xhr) {
        $("#results-users").append("POST /users - EXPECTED STATUS: 200<br/>");
        insertedId = data.id;
        $("#results-users").append("OK (inserted id: " + insertedId +")<br/>");
        $("#results-users").append(JSON.stringify(data));
        $("#results-users").append("<br/><br/>");


        // PRUEBAS DE GET /users/userId
        $.ajax({
            url: '/users/' + insertedId,
            method: 'GET',
            headers: {"X-Auth-Token": authData}
        }).done(function (data, statusText, xhr) {
            $("#results-users").append("GET /users/"+ insertedId +" - EXPECTED STATUS: 200<br/>");
            if(String(xhr.status) === "200")  {
                $("#results-users").append(JSON.stringify(data) + "<br/>");
                $("#results-users").append("OK</br></br>");

                $.ajax({
                    url: '/users/' + insertedId,
                    method: 'PUT',
                    data: JSON.stringify({username: 'DanielGarcía', password: 'Daniel123', email: 'daniel@gmail.com', enabled: 'true', roles: ['ROLE_USER', 'ROLE_ADMIN']}),
                    contentType: "application/json",
                    dataType: "json",
                    headers: {"X-Auth-Token": authData}
                }).done(function (data, statusText, xhr) {
                    $("#results-users").append("PUT /users/"+ insertedId +" - EXPECTED STATUS: 200<br/>");
                    insertedId = data.id;
                    $("#results-users").append(JSON.stringify(data) + "<br/>");
                    $("#results-users").append("OK (updated id: " + insertedId + ")<br/><br/>");
                    // PRUEBAS DE DELETE /users
                    $.ajax({
                        url: '/users/' + insertedId,
                        method: 'DELETE',
                        headers: {"X-Auth-Token": authData}
                    }).done(function (data, statusText, xhr) {
                        $("#results-users").append("DELETE /users/"+ insertedId +" - EXPECTED STATUS: 204<br/>");
                        if(String(xhr.status) === "204")  {
                            $("#results-users").append("OK</br></br>");
                        }
                        else
                            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
                    }).fail(function (xhr, textStatus, errorThrown) {
                        $("#results-users").append("DELETE /users"+ insertedId +" - EXPECTED STATUS: 204<br/>");
                        $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
                    });

                    // PRUEBAS DE DELETE /users (id inexistente)
                    $.ajax({
                        url: '/users/' + (insertedId + 1),
                        method: 'DELETE',
                        headers: {"X-Auth-Token": authData}
                    }).done(function (data, statusText, xhr) {
                        $("#results-users").append("DELETE /users/"+ (insertedId + 1) +" - EXPECTED STATUS: 404<br/>");
                        if(String(xhr.status) === "404")  {
                            $("#results-users").append("OK</br></br>");
                        }
                        else
                            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
                    }).fail(function (xhr, textStatus, errorThrown) {
                        $("#results-users").append("DELETE /users/"+ (insertedId + 1) +" - EXPECTED STATUS: 404<br/>");
                        if(String(xhr.status) == "404")  {
                            $("#results-users").append("OK<br/><br/>");
                        }
                        else
                            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
                    });

                    // PRUEBAS DE GET /users (id inexistente)
                    $.ajax({
                        url: '/users/' + (insertedId + 1),
                        method: 'GET',
                        headers: {"X-Auth-Token": authData}
                    }).done(function (data, statusText, xhr) {
                        $("#results-users").append("GET /users/"+ (insertedId + 1) +" - EXPECTED STATUS: 404<br/>");
                        if(String(xhr.status) === "404")  {
                            $("#results-users").append("OK</br></br>");
                        }
                        else
                            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
                    }).fail(function (xhr, textStatus, errorThrown) {
                        $("#results-users").append("GET /users/"+ (insertedId + 1) +" - EXPECTED STATUS: 404<br/>");
                        if(String(xhr.status) == "404")  {
                            $("#results-users").append("OK<br/><br/>");
                        }
                        else
                            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
                    });

                    // PRUEBAS DE PUT /users (id inexistente)
                    $.ajax({
                        url: '/users/' + (insertedId + 1),
                        method: 'PUT',
                        headers: {"X-Auth-Token": authData}
                    }).done(function (data, statusText, xhr) {
                        $("#results-users").append("PUT /users/"+ (insertedId + 1) +" - EXPECTED STATUS: 404<br/>");
                        if(String(xhr.status) === "404")  {
                            $("#results-users").append("OK</br></br>");
                        }
                        else
                            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
                    }).fail(function (xhr, textStatus, errorThrown) {
                        $("#results-users").append("PUT /users/"+ (insertedId + 1) +" - EXPECTED STATUS: 404<br/>");
                        if(String(xhr.status) == "404")  {
                            $("#results-users").append("OK<br/><br/>");
                        }
                        else
                            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
                    });
                }).fail(function (xhr, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                    $("#results-users").append("PUT /users/"+ insertedId +" - EXPECTED STATUS: 200<br/>");
                    $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
                });
            }
            else
                $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
        }).fail(function (xhr, textStatus, errorThrown) {
            $("#results-users").append("DELETE /users"+ insertedId +" - EXPECTED STATUS: 204<br/>");
            $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
        });

    }).fail(function (xhr, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
        $("#results-users").append("POST /users - EXPECTED STATUS: 200<br/>");
        $("#results-users").append("<b>NOT OK (" + xhr.status + ")</b><br/><br/>");
    });
});
