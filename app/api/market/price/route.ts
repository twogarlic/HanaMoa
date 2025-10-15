import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function GET() {
  try {
    const pythonScriptPath = path.join(process.cwd(), 'scripts', 'metal_crawler.py')
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [pythonScriptPath])
      let data = ''
      let errorData = ''
      
      pythonProcess.stdout.on('data', (chunk) => {
        data += chunk
      })
      
      pythonProcess.stderr.on('data', (chunk) => {
        errorData += chunk
      })
      
      pythonProcess.on('close', (code) => {
        if (code === 0 && data.trim()) {
          try {
            const lines = data.trim().split('\n')
            const gold: any = {}
            const silver: any = {}
            let isFirstSet = true
            
            lines.forEach(line => {
              if (line.includes('고시회차:')) {
                const value = parseInt(line.split(':')[1].trim())
                if (isFirstSet) {
                  gold.round = value
                } else {
                  silver.round = value
                }
              } else if (line.includes('시각:')) {
                const value = line.split(':')[1].trim()
                if (isFirstSet) {
                  gold.time = value
                } else {
                  silver.time = value
                }
              } else if (line.includes('계좌입금시:')) {
                const value = parseFloat(line.split(':')[1].trim())
                if (isFirstSet) {
                  gold.depositPrice = value
                } else {
                  silver.depositPrice = value
                }
              } else if (line.includes('계좌출금시:')) {
                const value = parseFloat(line.split(':')[1].trim())
                if (isFirstSet) {
                  gold.withdrawalPrice = value
                  isFirstSet = false 
                } else {
                  silver.withdrawalPrice = value
                }
              }
            })
            
            resolve(NextResponse.json({ gold, silver }))
          } catch (e) {
            reject(NextResponse.json({ error: '데이터 파싱 실패' }, { status: 500 }))
          }
        } else {
          reject(NextResponse.json({ error: '크롤링 실패' }, { status: 500 }))
        }
      })
      
      setTimeout(() => {
        pythonProcess.kill()
        reject(NextResponse.json({ error: '크롤링 타임아웃' }, { status: 500 }))
      }, 30000)
    })
  } catch (error) {
    return NextResponse.json(
      { error: '가격 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
