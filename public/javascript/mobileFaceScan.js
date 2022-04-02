const startbutton = document.getElementById('startbutton');

startbutton.addEventListener('click', function(ev) {
    document.getElementById('result').classList.remove('available');
    const formData = new FormData();
    formData.append('inputImg', document.getElementById('inputImg').files[0]);
    const result = await axios.post('/facescan', formData);
    if(result.data.verified) {
        document.getElementById('result').classList.add('available');
        document.getElementById('resultText').innerHTML = 'Match Found';
        document.getElementById('resultText').classList.remove('failure');
        document.getElementById('resultText').classList.add('success');
        document.getElementById('missingReportShowBtn').style.display = 'flex';
        document.getElementById('missingReportShowBtn').addEventListener('click', () => {
            showMissingReport(result.data.report);
        })
    } else {
        document.getElementById('result').classList.add('available');
        document.getElementById('resultText').innerHTML = 'Match Not Found';
        document.getElementById('resultText').classList.remove('success');
        document.getElementById('resultText').classList.add('failure');
    }
    document.getElementById('loader').style.display='none';
});

function showMissingReport(report) {
    console.log(report);
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('modalMissingPersonName').innerHTML = report.missingPersonName;
    document.getElementById('modalMissingPersonAge').innerHTML = report.age;
    document.getElementById('modalMissingPersonGender').innerHTML = report.gender[0];
    document.getElementById('missingModal').style.display = 'flex';
}
