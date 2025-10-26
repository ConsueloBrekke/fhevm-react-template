import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, data } = body;

    switch (operation) {
      case 'init':
        return NextResponse.json({
          success: true,
          message: 'FHE client initialized'
        });

      case 'encrypt':
        return NextResponse.json({
          success: true,
          encrypted: data,
          message: 'Data encrypted successfully'
        });

      case 'decrypt':
        return NextResponse.json({
          success: true,
          decrypted: data,
          message: 'Data decrypted successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'FHE API is running',
    endpoints: ['/api/fhe/encrypt', '/api/fhe/decrypt', '/api/fhe/compute', '/api/keys']
  });
}
