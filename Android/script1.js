document.addEventListener("DOMContentLoaded", function() {
    const lightButton = document.getElementById("lightButton");
    const lightStatus = document.getElementById("lightStatus");
    const fanSpeedRange = document.getElementById("fanSpeedRange");
    const fanSpeedValue = document.getElementById("fanSpeedValue");
    const fanStatus = document.getElementById("fanStatus");

    lightButton.addEventListener("click", function() {
        toggleLight();
    });

    fanSpeedRange.addEventListener("input", function() {
        const speed = fanSpeedRange.value;
        fanSpeedValue.innerText = speed + "%";
        updateFanSpeed(speed / 100);
    });

    function toggleLight() {
        // Lấy trạng thái hiện tại của đèn
        fetch("http://192.168.137.36:8080/api/device-status")
            .then(response => response.json())
            .then(data => {
                const currentLightStatus = data.light.status;
                // Đảo ngược trạng thái và gửi yêu cầu cập nhật
                const newLightStatus = currentLightStatus === "On" ? "Off" : "On";
                sendLightRequest(newLightStatus);
            })
            .catch(error => console.error(error));
    }

    function sendLightRequest(newStatus) {
        
        fetch("http://192.168.137.36:8080/api/device-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ light: newStatus })
        })
        .then(response => {
            if (response.status === 200) {
                // Cập nhật trạng thái đèn sau khi hoàn thành yêu cầu
                lightStatus.textContent = newStatus;
            }
        })
        .catch(error => console.error(error));
    }

    function updateFanSpeed(speed) {
        // Lấy trạng thái hiện tại của quạt
        fetch("http://192.168.137.36:8080/api/device-status")
            .then(response => response.json())
            .then(data => {
                const currentFanStatus = data.fan.status;
                // Đảo ngược trạng thái và gửi yêu cầu cập nhật
                const newFanStatus = currentFanStatus === "High" ? "Low" : "High";
                sendFanRequest(newFanStatus, speed);
            })
            .catch(error => console.error(error));
    }

    function sendFanRequest(newStatus, speed) {
        console.log(speed);
        fetch("http://192.168.137.36:8080/api/device-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fanSpeed: speed }, {fanStatus: newStatus})
        })
        .then(response => {
            if (response.status === 200) {
                // Cập nhật trạng thái và tốc độ quạt sau khi hoàn thành yêu cầu
                fanStatus.textContent = newStatus;
                fanSpeedValue.textContent = `${speed * 100}%`;
            }
        })
        .catch(error => console.error(error));
    }
});
