import { NextResponse } from 'next/server'
import prismaPrice from '../../../../lib/database-price'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

export async function GET() {
  try {
    
    let pythonPath = 'python3'
    try {
      pythonPath = execSync('which python3', { encoding: 'utf8' }).trim()
    } catch (error) {
    }
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'run_prediction.py')
    
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json({
        success: false,
        error: '예측 스크립트를 찾을 수 없습니다.'
      }, { status: 404 })
    }
    
    
    const pythonProcess = spawn(pythonPath, [scriptPath, '--json'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL_RAILWAY: process.env.DATABASE_URL_RAILWAY,
        DATABASE_URL: process.env.DATABASE_URL
      }
    })
    
    let output = ''
    let errorOutput = ''
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    return new Promise((resolve) => {
      pythonProcess.on('close', async (code) => {
        if (code === 0) {
          try {
            const predictionResult = JSON.parse(output)
            
            if (predictionResult.success) {
              await savePredictionToDB(predictionResult.prediction)
              
              resolve(NextResponse.json({
                success: true,
                message: '예측값이 성공적으로 저장되었습니다.',
                timestamp: new Date().toISOString(),
                prediction: predictionResult.prediction
              }))
            } else {
              resolve(NextResponse.json({
                success: false,
                error: predictionResult.error
              }, { status: 500 }))
            }
          } catch (parseError) {
            resolve(NextResponse.json({
              success: false,
              error: '예측 결과 파싱 중 오류가 발생했습니다.',
              output: output
            }, { status: 500 }))
          }
        } else {
          resolve(NextResponse.json({
            success: false,
            error: '예측 스크립트 실행 중 오류가 발생했습니다.',
            output: output,
            errorOutput: errorOutput
          }, { status: 500 }))
        }
      })
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '예측 및 저장 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

async function savePredictionToDB(prediction: any) {
  try {
    const predictionData = {
      asset: 'gold',
      predictionDate: new Date().toISOString().split('T')[0], 
      direction: prediction.direction,
      confidence: prediction.confidence,
      probability: prediction.probability,
      nextDayPrediction: prediction.nextDayPrediction,
      basedOnDays: prediction.basedOnDays,
      createdAt: new Date()
    }
    
    await prismaPrice.$executeRaw`
      INSERT INTO gold_predictions (asset, prediction_date, direction, confidence, probability, next_day_prediction, based_on_days, created_at)
      VALUES (${predictionData.asset}, ${predictionData.predictionDate}, ${predictionData.direction}, ${predictionData.confidence}, ${predictionData.probability}, ${predictionData.nextDayPrediction}, ${predictionData.basedOnDays}, ${predictionData.createdAt})
      ON DUPLICATE KEY UPDATE
        direction = VALUES(direction),
        confidence = VALUES(confidence),
        probability = VALUES(probability),
        next_day_prediction = VALUES(next_day_prediction),
        based_on_days = VALUES(based_on_days),
        created_at = VALUES(created_at)
    `
    
    
  } catch (error) {
    throw error
  }
}
