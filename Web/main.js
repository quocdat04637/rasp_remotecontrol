document.addEventListener("DOMContentLoaded", function() {
    refreshButton.addEventListener("click", function() {
        refreshDeviceStatus();
    });

    function refreshDeviceStatus() {
        // Gửi yêu cầu GET để lấy trạng thái từ API
        fetch("http://192.168.193.142:8080/api/device-status")
            .then(response => response.json())
            .then(data => {
                    // Cập nhật thông tin từ dữ liệu lấy được
                    document.getElementById('lightStatus').textContent = data.light.status;
                    document.getElementById('lightSwitchCount').textContent = data.light.switchCount;
                    document.getElementById('lightUsageTime').textContent = data.light.usageTime;

                    document.getElementById('fanStatus').textContent = data.fan.status;
                    document.getElementById('fanSpeed').textContent = data.fan.speed;
                    document.getElementById('fanUsageTime').textContent = data.fan.usageTime;
                })
            .catch(error => console.error(error));
    }

    // Gọi hàm refreshDeviceStatus để cập nhật trạng thái ban đầu khi trang được nạp.
    refreshDeviceStatus();
});

