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
        updateFanSpeed(parseFloat(speed/100));
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
                document.getElementById("lightStatus").textContent = newStatus;
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

        // // Gửi yêu cầu cập nhật tốc độ quạt
        // fetch("http://192.168.137.36:8080/api/device-status", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({ fanSpeed: speed })
        // })
        // .then(response => {
        //     if (response.status === 200) {
        //         // Cập nhật trạng thái tốc độ quạt sau khi hoàn thành yêu cầu
        //         document.getElementById("fanStatus").textContent = speed > 0 ? "High" : "Low";
        //     }
        // })
        // .catch(error => console.error(error));
    }

    function sendFanRequest(newStatus, speed) {
        fetch("http://192.168.137.36:8080/api/device-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fan: {"status": newStatus, "speed": speed} })
        })
        .then(response => {
            if (response.status === 200) {
                // Cập nhật trạng thái đèn sau khi hoàn thành yêu cầu
                document.getElementById("lightStatus").textContent = newStatus;
            }
        })
        .catch(error => console.error(error));
    }
    
    
    
   
});
