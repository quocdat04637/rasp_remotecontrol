from flask import Flask, request, jsonify
import RPi.GPIO as GPIO

app = Flask(__name)

# Thiết lập GPIO cho đèn và quạt
light_pin = 17  # GPIO pin cho đèn
fan_pin = 18    # GPIO pin cho quạt

GPIO.setmode(GPIO.BCM)
GPIO.setup(light_pin, GPIO.OUT)
GPIO.setup(fan_pin, GPIO.OUT)

# Thiết lập trạng thái ban đầu của các thiết bị
devices = {
    "light": "Off",
    "fan": "Off"
}

# API endpoint để lấy trạng thái của các thiết bị
@app.route('/api/devices', methods=['GET'])
def get_device_status():
    return jsonify(devices)

# API endpoint để cập nhật trạng thái của các thiết bị
@app.route('/api/devices', methods=['POST'])
def update_device_status():
    data = request.get_json()
    for device, status in data.items():
        if device in devices:
            devices[device] = status

            # Xử lý các yêu cầu điều khiển thiết bị
            if device == "light":
                if status == "On":
                    GPIO.output(light_pin, GPIO.HIGH)  # Bật đèn
                else:
                    GPIO.output(light_pin, GPIO.LOW)  # Tắt đèn
            elif device == "fan":
                if status == "High":
                    GPIO.output(fan_pin, GPIO.HIGH)  # Điều chỉnh tốc độ quạt cao
                else:
                    GPIO.output(fan_pin, GPIO.LOW)  # Tắt quạt

    return 'Success', 200

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=8080)
    finally:
        GPIO.cleanup()
