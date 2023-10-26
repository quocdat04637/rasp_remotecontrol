var lightStatusIcon = document.querySelector('#lightDevice .status i');
var fanStatusIcon = document.querySelector('#fanDevice .status i');


document.addEventListener("DOMContentLoaded", function() {
    refreshButton.addEventListener("click", function() {
        refreshDeviceStatus();
    });

    function refreshDeviceStatus() {
        // Gửi yêu cầu GET để lấy trạng thái từ API
        fetch("http://192.168.137.36:8080/api/device-status")
            .then(response => response.json())
            .then(data => {
                    // Cập nhật thông tin từ dữ liệu lấy được
                    document.getElementById('lightStatus').textContent = data.light.status;
                    if (data.light.status == "On") {
                        lightStatusIcon.className = 'fa-solid fa-toggle-on';
                        document.getElementById('lightStatus').textContent = "On"
                    } else {
                        lightStatusIcon.className = 'fa-solid fa-toggle-off';
                    }
                    document.getElementById('lightSwitchCount').textContent = data.light.switchCount;
                    document.getElementById('lightUsageTime').textContent = data.light.usageTime;


                    document.getElementById('fanStatus').textContent = data.fan.status;
                    if (data.fan.status == "High") {
                        fanStatusIcon.className = 'fa-solid fa-toggle-on';
                        document.getElementById('fanStatus').textContent = "High"
                    } else {
                        fanStatusIcon.className = 'fa-solid fa-toggle-off';
                    }
                    document.getElementById('fanSpeed').textContent = data.fan.speed;
                    document.getElementById('fanUsageTime').textContent = data.fan.usageTime;
                })
            .catch(error => console.error(error));
    }

    // Gọi hàm refreshDeviceStatus để cập nhật trạng thái ban đầu khi trang được nạp.
    refreshDeviceStatus();
});

