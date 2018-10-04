var i = 0,
    no = 1,
    csv =   "1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19\n" + 
            "№;Документ;Номер;Дата;Сумма;Назначение Платежа;Плательщик;Плательщик ИНН;" + 
            "Плательщик Счет;Плательщик Банк;Плательщик БИК;Получатель;Получатель ИНН;" + 
            "Получатель Счет;Получатель Банк;Получатель БИК;Вид Оплаты;Дата Списано;Дата Поступило;\n";

// получаем файл
document.getElementById('file1').addEventListener('change', function (e) {

    var file1 = e.target.files[0];  // первый элемент массива файлов

    var reader = new FileReader();
    // при успешном завершении операции чтения
    reader.onload = (function (file1) {
        return function (e) {
            var r = e.target;
            // получаем содержимое файла, состояние чтения, ошибки(или null)
            // console.log(r.result, r.readyState, r.error);
            formattedTxtInCsv(r.result);
            downloadCsvFile();
        };
    })(file1);

    // получить содержимое как текст
    reader.readAsText(file1);
});

// форматируем txt в csv
function formattedTxtInCsv(txt) {
    var paymentOrder = txt.split("СекцияДокумент");
    // extractAccountData(paymentOrder[0]);
    for ( i=1; i<paymentOrder.length; i++ ) {
        csv = csv + i + ";";
        extractPaymentOrder(paymentOrder[i]);
    }
}

function extractPaymentOrder(paymentOrder) {
    // console.log(paymentOrder);
    paymentOrder = replaceDate(paymentOrder);

    var documentType = extractBetween(paymentOrder, "=", "Номер"),
        number = extractBetween(paymentOrder, "Номер", "Дата"),
        date = extractBetween(paymentOrder, "Дата", "Сумма"),
        amount = extractBetween(paymentOrder, "Сумма", "НазначениеПлатежа"),
        purposeOfPayment = extractBetween(paymentOrder, "НазначениеПлатежа", "Плательщик1"),
        payer = extractBetween(paymentOrder, "Плательщик1", "ПлательщикИНН"),
        payerINN = extractBetween(paymentOrder, "ПлательщикИНН", "ПлательщикСчет"),
        payerAccount = extractBetween(paymentOrder, "ПлательщикСчет", "СтатусСоставителя"),
        payerBank = extractBetween(paymentOrder, "ПлательщикБанк1", "ПлательщикБИК"),
        payerBIK = extractBetween(paymentOrder, "ПлательщикБИК", "ПлательщикКорсчет"),
        recipient = extractBetween(paymentOrder, "Получатель1", "ПолучательИНН"),
        recipientINN = extractBetween(paymentOrder, "ПолучательИНН", "ПолучательСчет"),
        recipientAccount = extractBetween(paymentOrder, "ПолучательСчет", "ВидОплаты"),
        recipientBank = extractBetween(paymentOrder, "ПолучательБанк1", "ПолучательБИК"),
        recipientBIK = extractBetween(paymentOrder, "ПолучательБИК", "ПолучательКорсчет"),
        viewPayments = extractBetween(paymentOrder, "ВидПлатежа", "ДатаСписано"),
        dateWrittenOff = extractBetween(paymentOrder, "ДатаСписано", "ДатаПоступило"),
        dateReceived = extractBetween(paymentOrder, "ДатаПоступило", "ПолучательБанк1");
    // console.log(paymentOrder.substring(0, 1)); 
    // console.log(viewPayments + "|" + dateWrittenOff + "|" + dateReceived);
    csv = csv +  "'" + documentType + ";'" + number + ";'" + date + ";'" + amount + ";'" + purposeOfPayment + ";'" + payer + ";'" + payerINN + ";'" + payerAccount + ";'" + payerBank + ";'" + payerBIK + ";'" + recipient + ";'" + recipientINN + ";'" + recipientAccount + ";'" + recipientBank + ";'" + recipientBIK + ";'" + viewPayments + ";'" + dateWrittenOff + ";'" + dateReceived + "\n";
}

function extractBetween(txt, label1, label2) {
    var label1Length = label1.length;
    var label1Position = txt.indexOf(label1);
    var label2Position = txt.indexOf(label2);
    var start = label1Position + label1Length + 1;
    var finish = label2Position - 1;
    var value;
    if (label1Position != -1 && label2Position != -1 && start+1 < finish) {
        value = txt.substring(start, finish);
    } else {
        value = '';
    }
    if (label1 === "ПолучательБИК") {
        console.log((label1Position + label1Length + 1) + "|" + label2Position);
        console.log(label1 + "|" + label1Length + "|" + label1Position + "|" + label2Position + "|" + value);
    }
    return value;
}

function replaceDate(paymentOrder) {

    paymentOrder = replaceCRLF(paymentOrder);
    // console.log(paymentOrder);

    var positionDateWrittenOff = paymentOrder.indexOf("ДатаСписано");
    var positionDateReceived = paymentOrder.indexOf("ДатаПоступило");
    var first;
    var second;
    var between;
    var length;

    // correct equals
    first = paymentOrder.substring(0, 1);
    second = paymentOrder.substring(1);
    between = "\n";
    paymentOrder = first + between + second;

    if (positionDateWrittenOff != -1) {
        length = positionDateWrittenOff + "ДатаПоступило".length + "01.01.1970".length + 1;
        first = paymentOrder.substring(0, length);
        second = paymentOrder.substring(length);
        between = "ДатаПоступило=\n";
        paymentOrder = first + between + second;
    }
    if (positionDateReceived != -1) {
        length = positionDateReceived;
        first = paymentOrder.substring(0, length);
        second = paymentOrder.substring(length);
        between = "ДатаСписано=\n";
        paymentOrder = first + between + second;
    }
    // console.log(paymentOrder);
    return paymentOrder;
}

function downloadCsvFile() {
    var statement = document.getElementById("download");
    statement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    statement.target = '_blank';
    statement.color =  "green";
    statement.download = 'statement.csv';
    // console.log( statement );
    // statement.click();
}

function replaceCRLF(txt) {
    var pattern = /\r\n|\r|\n/g;
    return txt.replace(pattern,"\n");
}

function testAddFunction(awesomeParameter) {
    alert(awesomeParameter);
    return awesomeParameter;
}