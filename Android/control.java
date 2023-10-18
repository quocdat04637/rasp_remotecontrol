package com.example.myapplication;

import android.app.Activity;
import android.os.Bundle;
import android.widget.SeekBar;
import android.widget.SeekBar.OnSeekBarChangeListener;
import android.widget.Button;
import android.view.View;
import android.widget.TextView;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {

    private SeekBar fanSpeedSeekBar;
    private Button lightButton;
    private TextView fanSpeedTextView;

    private final Executor executor = Executors.newFixedThreadPool(2);



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        fanSpeedSeekBar = findViewById(R.id.fanSpeedSeekBar);
        lightButton = findViewById(R.id.lightButton);
        fanSpeedTextView = findViewById(R.id.fanSpeedTextView);

        fanSpeedSeekBar.setOnSeekBarChangeListener(new OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                // Hiển thị giá trị tốc độ quạt trên TextView
                fanSpeedTextView.setText("Tốc độ quạt: " + Integer.toString(progress));

                // Gửi yêu cầu điều chỉnh tốc độ quạt khi giá trị thay đổi
                updateFanSpeed(progress);

                // Gửi yêu cầu điều chỉnh tốc độ quạt khi giá trị thay đổi
                executeControlTask("fan", String.valueOf(progress));
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
                // Xử lý khi bắt đầu di chuyển thanh trượt (nếu cần)
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
                // Xử lý khi kết thúc di chuyển thanh trượt (nếu cần)
            }
        });

        lightButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Thay đổi trạng thái của button
                lightButton.setSelected(!lightButton.isSelected());
                if (lightButton.isSelected()) {
                    lightButton.setText("Off");
                    // Gửi yêu cầu tắt đèn
                    executeControlTask("light", "Off");
                } else {
                    lightButton.setText("On");
                    // Gửi yêu cầu bật đèn
                    executeControlTask("light", "On");
                }
            }
        });
    }



    private void updateFanSpeed(int fanSpeed) {
        executor.execute(() -> {
            try {
                URL url = new URL("http://192.168.193.142:8080/api/device-status");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                connection.setDoOutput(true);

                // Tạo một JSON object chứa giá trị tốc độ quạt để gửi lên máy chủ
                JSONObject fanSpeedData = new JSONObject();
                fanSpeedData.put("fan_speed", String.valueOf(fanSpeed));

                // Chuyển đối tượng JSON thành chuỗi JSON
                String jsonInputString = fanSpeedData.toString();

                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                connection.getResponseCode(); // Thực hiện yêu cầu

            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private void executeControlTask(String device, String status) {
        executor.execute(() -> {
            try {
                URL url = new URL("http://192.168.193.142:8080/api/device-status");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                connection.setDoOutput(true);

                String jsonInputString = "{\"" + device + "\": \"" + status + "\"}";

                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                connection.getResponseCode(); // Thực hiện yêu cầu

            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}

