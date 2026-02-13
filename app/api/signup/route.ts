import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'El registro público no está habilitado. Contacte al administrador.' },
    { status: 403 }
  );
}
