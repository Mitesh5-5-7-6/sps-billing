import { NextResponse } from 'next/server';

export function apiResponse<T>(data: T, message: string, code: number) {
    return NextResponse.json({
        success: true,
        data,
        message,
    }, { status: code });
}

export function badRequest(message: string) {
    return NextResponse.json({
        success: false,
        message,
    }, { status: 400 });
}

export function unauthorized(message = 'Unauthorized') {
    return NextResponse.json({
        success: false,
        message,
    }, { status: 401 });
}

export function notFound(message: string) {
    return NextResponse.json({
        success: false,
        message,
    }, { status: 404 });
}

export function conflict(message: string) {
    return NextResponse.json({
        success: false,
        message,
    }, { status: 409 });
}

export function internalServerError(error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
        success: false,
        message: 'Internal Server Error',
        error: errMsg
    }, { status: 500 });
}