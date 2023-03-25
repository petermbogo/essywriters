window.onerror = function (message, source, lineno, colno, error) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/jslogger', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            console.log('error saved');
        }
    };

    var params = "source="+source
        +"&message="+message
        +"&lineno="+lineno
        +"&colno="+colno
        +"&error="+error;

    xhr.send(params);
};
