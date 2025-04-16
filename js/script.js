document.addEventListener("DOMContentLoaded", () => {
    // キャンバス要素の取得
    const fourWheelCanvas = document.getElementById("fourWheelCanvas");
    //const threeWheelCanvas = document.getElementById("threeWheelCanvas");
    const fourWheelCtx = fourWheelCanvas.getContext("2d");
    //const threeWheelCtx = threeWheelCanvas.getContext("2d");
    
    // スティック表示要素
    const stickDot = document.getElementById("stickDot");
    const xValueDisplay = document.getElementById("xValue");
    const yValueDisplay = document.getElementById("yValue");
    
    // スティック状態
    let stickX = 0;
    let stickY = 0;
    
    // ゲームパッド接続イベント
    window.addEventListener("gamepadconnected", (e) => {
        console.log("ゲームパッド接続:", e.gamepad.id);
    });
    
    // ゲームパッド切断イベント
    window.addEventListener("gamepaddisconnected", (e) => {
        console.log("ゲームパッド切断:", e.gamepad.id);
        stickX = 0;
        stickY = 0;
        updateStickVisual();
        drawWheels();
    });
    
    // スティック表示の更新
    function updateStickVisual() {
        const maxOffset = 40; // スティックの最大移動距離
        stickDot.style.transform = `translate(${stickX * maxOffset}px, ${stickY * maxOffset}px)`;
        xValueDisplay.textContent = stickX.toFixed(2);
        yValueDisplay.textContent = stickY.toFixed(2);
    }
    
    // 角度の差を計算する関数（ラジアン）
    function angleDifference(angle1, angle2) {
        let diff = (angle1 - angle2) % (2 * Math.PI);
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;
        return Math.abs(diff);
    }
    
    // 4輪オムニホイールの描画
    function drawFourWheelSystem(ctx, moveX, moveY) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const size = Math.min(width, height) * 0.6;
        
        // キャンバスをクリア
        ctx.clearRect(0, 0, width, height);
        
        // 背景を描画
        ctx.fillStyle = "#f8f8f8";
        ctx.fillRect(0, 0, width, height);
        
        // 車体（正方形）を描画
        ctx.beginPath();
        ctx.moveTo(centerX - size/2, centerY - size/2);
        ctx.lineTo(centerX + size/2, centerY - size/2);
        ctx.lineTo(centerX + size/2, centerY + size/2);
        ctx.lineTo(centerX - size/2, centerY + size/2);
        ctx.closePath();
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 8;
        ctx.stroke();
        
        // 移動方向の角度を計算（ラジアン）
        const moveAngle = Math.atan2(moveY, moveX);
        
        // ホイールの位置（4つの角）
        const wheelPositions = [
            { x: centerX - size/2, y: centerY - size/2, angle: -Math.PI/4 },  // 左上
            { x: centerX + size/2, y: centerY - size/2, angle: Math.PI/4 },   // 右上
            { x: centerX + size/2, y: centerY + size/2, angle: 3*Math.PI/4 }, // 右下
            { x: centerX - size/2, y: centerY + size/2, angle: -3*Math.PI/4 } // 左下
        ];
        
        // 各ホイールの方向角度（ラジアン）
        const wheelDirections = [
            Math.PI/4,    // 左上のホイールは45度方向に力を発生
            3*Math.PI/4,  // 右上のホイールは135度方向に力を発生
            5*Math.PI/4,  // 右下のホイールは225度方向に力を発生
            7*Math.PI/4   // 左下のホイールは315度方向に力を発生
        ];
        
        // 移動方向と近い（±3度以内）のホイールとその対角のホイールを特定
        const thresholdRadians = 3 * (Math.PI / 180); // 3度をラジアンに変換
        const hideWheels = [];
        
        // 移動ベクトルの大きさが十分あるかチェック
        const moveMagnitude = Math.sqrt(moveX * moveX + moveY * moveY);
        if (moveMagnitude > 0.1) { // 小さすぎる入力は無視
            wheelDirections.forEach((direction, index) => {
                if (angleDifference(moveAngle, direction) <= thresholdRadians) {
                    hideWheels.push(index);
                    // 対角のホイールも追加
                    hideWheels.push((index + 2) % 4);
                }
            });
        }
        
        // ホイールを描画
        wheelPositions.forEach((pos, index) => {
            // ホイールの回転方向を計算
            const wheelDirX = Math.cos(pos.angle);
            const wheelDirY = Math.sin(pos.angle);
            
            // 移動ベクトルをホイール方向に投影（符号を反転）
            let moveProjection =  -(moveX * wheelDirY + moveY * wheelDirX);
            
            // 右上と左下のホイールの矢印を反転
            if (index === 1 || index === 3) {
                moveProjection = -moveProjection;
            }
            
            // 指定方向と近いホイールは矢印を表示しない
            const showArrow = !hideWheels.includes(index);
            
            // ホイールを描画
            drawWheel(ctx, pos.x, pos.y, pos.angle, moveProjection, showArrow);
        });
        
        // 移動方向の矢印を描画
        if (moveX !== 0 || moveY !== 0) {
            const arrowLength = size * 0.6;
            const arrowX = centerX + moveX * arrowLength;
            const arrowY = centerY + moveY * arrowLength;
            
            drawArrow(ctx, centerX, centerY, arrowX, arrowY, "#e74c3c", 5);
        }
    }
    
    // // 3輪オムニホイールの描画
    // function drawThreeWheelSystem(ctx, moveX, moveY) {
    //     const width = ctx.canvas.width;
    //     const height = ctx.canvas.height;
    //     const centerX = width / 2;
    //     const centerY = height / 2;
    //     const size = Math.min(width, height) * 0.6;
        
    //     // キャンバスをクリア
    //     ctx.clearRect(0, 0, width, height);
        
    //     // 背景を描画
    //     ctx.fillStyle = "#f8f8f8";
    //     ctx.fillRect(0, 0, width, height);
        
    //     // 車体（三角形）を描画
    //     ctx.beginPath();
    //     ctx.moveTo(centerX, centerY - size/2);
    //     ctx.lineTo(centerX + size/2 * Math.cos(Math.PI/6), centerY + size/2 * Math.sin(Math.PI/6));
    //     ctx.lineTo(centerX - size/2 * Math.cos(Math.PI/6), centerY + size/2 * Math.sin(Math.PI/6));
    //     ctx.closePath();
    //     ctx.strokeStyle = "#888";
    //     ctx.lineWidth = 8;
    //     ctx.stroke();
        
    //     // 移動方向の角度を計算（ラジアン）
    //     const moveAngle = Math.atan2(moveY, moveX);
        
    //     // ホイールの位置（3つの角）
    //     const wheelPositions = [
    //         { x: centerX, y: centerY - size/2, angle: 0 },                                          // 上
    //         { x: centerX + size/2 * Math.cos(Math.PI/6), y: centerY + size/2 * Math.sin(Math.PI/6), angle: 2*Math.PI/3 },  // 右下
    //         { x: centerX - size/2 * Math.cos(Math.PI/6), y: centerY + size/2 * Math.sin(Math.PI/6), angle: -2*Math.PI/3 }  // 左下
    //     ];
        
    //     // 各ホイールの方向角度（ラジアン）
    //     const wheelDirections = [
    //         Math.PI/2,      // 上のホイールは90度方向に力を発生
    //         7*Math.PI/6,    // 右下のホイールは210度方向に力を発生
    //         11*Math.PI/6    // 左下のホイールは330度方向に力を発生
    //     ];
        
    //     // 移動方向と近い（±3度以内）のホイールを特定
    //     const thresholdRadians = 3 * (Math.PI / 180); // 3度をラジアンに変換
    //     const hideWheels = [];
        
    //     // 移動ベクトルの大きさが十分あるかチェック
    //     const moveMagnitude = Math.sqrt(moveX * moveX + moveY * moveY);
    //     if (moveMagnitude > 0.1) { // 小さすぎる入力は無視
    //         wheelDirections.forEach((direction, index) => {
    //             // 指定方向と近いホイールをチェック
    //             if (angleDifference(moveAngle, direction) <= thresholdRadians) {
    //                 hideWheels.push(index);
    //             }
                
    //             // 反対側（180°±3°）のホイールもチェック
    //             const oppositeAngle = (direction + Math.PI) % (2 * Math.PI);
    //             if (angleDifference(moveAngle, oppositeAngle) <= thresholdRadians) {
    //                 hideWheels.push(index);
    //             }
    //         });
    //     }
        
    //     // ホイールを描画
    //     wheelPositions.forEach((pos, index) => {
    //         // ホイールの回転方向を計算
    //         const wheelDirX = Math.cos(pos.angle + Math.PI/2);
    //         const wheelDirY = Math.sin(pos.angle + Math.PI/2);
            
    //         // 移動ベクトルをホイール方向に投影（符号を反転）
    //         let moveProjection = moveX * wheelDirX - moveY * wheelDirY;
            
    //         // 左下のホイールの矢印を反転
    //         if (index === 2) {
    //             moveProjection = -moveProjection;
    //         }
            
    //         // 指定方向と近いホイールは矢印を表示しない
    //         const showArrow = !hideWheels.includes(index);
            
    //         // ホイールを描画
    //         drawWheel(ctx, pos.x, pos.y, pos.angle, moveProjection, showArrow);
    //     });
        
    //     // 移動方向の矢印を描画
    //     if (moveX !== 0 || moveY !== 0) {
    //         const arrowLength = size * 0.6;
    //         const arrowX = centerX + moveX * arrowLength;
    //         const arrowY = centerY + moveY * arrowLength;
            
    //         drawArrow(ctx, centerX, centerY, arrowX, arrowY, "#e74c3c", 5);
    //     }
    // }
    
    // ホイールを描画する関数
    function drawWheel(ctx, x, y, angle, speed, showArrow = true) {
        const wheelWidth = 40;
        const wheelHeight = 20;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // ホイール本体
        ctx.fillStyle = "#ddd";
        ctx.fillRect(-wheelWidth/2, -wheelHeight/2, wheelWidth, wheelHeight);
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1;
        ctx.strokeRect(-wheelWidth/2, -wheelHeight/2, wheelWidth, wheelHeight);
        
        // 回転方向の矢印（showArrowがtrueで、speedが0でない場合のみ表示）
        if (showArrow && speed !== 0) {
            const arrowColor = "#3498db";
            const arrowDirection = speed > 0 ? 1 : -1;
            const arrowStart = -wheelWidth/2 * arrowDirection;
            const arrowEnd = wheelWidth/2 * arrowDirection;
            
            drawArrow(ctx, arrowStart, 0, arrowEnd, 0, arrowColor, 2);
        }
        
        ctx.restore();
    }
    
    // 矢印を描画する関数
    function drawArrow(ctx, fromX, fromY, toX, toY, color, lineWidth) {
        const headLength = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        
        // 矢印の先端
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI/6), toY - headLength * Math.sin(angle - Math.PI/6));
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI/6), toY - headLength * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
    
    // 両方のホイールシステムを描画
    function drawWheels() {
        // スティック入力を移動ベクトルに変換
        const moveX = stickX;
        const moveY = stickY;
        
        drawFourWheelSystem(fourWheelCtx, moveX, moveY);
        //drawThreeWheelSystem(threeWheelCtx, moveX, moveY);
    }
    
    // ゲームパッドの状態を更新
    function updateGamepadState() {
        if (navigator.getGamepads) {
            const gamepads = navigator.getGamepads();
            
            // 接続されているゲームパッドを探す
            for (const gp of gamepads) {
                if (gp) {
                    // PS4コントローラーの左スティックはaxes[0]（X）とaxes[1]（Y）
                    stickX = gp.axes[0];
                    stickY = gp.axes[1];
                    
                    // デッドゾーン処理
                    if (Math.abs(stickX) < 0.1) stickX = 0;
                    if (Math.abs(stickY) < 0.1) stickY = 0;
                    
                    updateStickVisual();
                    drawWheels();
                    break;
                }
            }
        }
        
        requestAnimationFrame(updateGamepadState);
    }
    
    // キーボード入力のサポート（テスト用）
    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowUp":
                stickY = -1;
                break;
            case "ArrowDown":
                stickY = 1;
                break;
            case "ArrowLeft":
                stickX = -1;
                break;
            case "ArrowRight":
                stickX = 1;
                break;
        }
        updateStickVisual();
        drawWheels();
    });
    
    document.addEventListener("keyup", (e) => {
        switch (e.key) {
            case "ArrowUp":
            case "ArrowDown":
                stickY = 0;
                break;
            case "ArrowLeft":
            case "ArrowRight":
                stickX = 0;
                break;
        }
        updateStickVisual();
        drawWheels();
    });
    
    // マウス/タッチ入力のサポート
    const stickDisplay = document.querySelector(".stick-display");
    let isDragging = false;
    
    function handlePointerDown(e) {
        isDragging = true;
        updateStickPosition(e);
    }
    
    function handlePointerMove(e) {
        if (isDragging) {
            updateStickPosition(e);
        }
    }
    
    function handlePointerUp() {
        isDragging = false;
        stickX = 0;
        stickY = 0;
        updateStickVisual();
        drawWheels();
    }
    
    function updateStickPosition(e) {
        const rect = stickDisplay.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // マウス/タッチ位置を取得
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        // 中心からの相対位置を計算
        let x = (clientX - rect.left - centerX) / centerX;
        let y = (clientY - rect.top - centerY) / centerY;
        
        // 値を-1から1の範囲に制限
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude > 1) {
            x /= magnitude;
            y /= magnitude;
        }
        
        stickX = x;
        stickY = y;
        updateStickVisual();
        drawWheels();
    }
    
    // マウスイベント
    stickDisplay.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("mouseup", handlePointerUp);
    
    // タッチイベント
    stickDisplay.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("touchmove", handlePointerMove);
    document.addEventListener("touchend", handlePointerUp);
    
    // 初期描画
    drawWheels();
    
    // ゲームパッドの状態を定期的に更新
    updateGamepadState();
});