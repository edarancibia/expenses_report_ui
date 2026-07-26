'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const today = () => new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validateFile(f);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateFile(f);
  };

  const validateFile = (f: File) => {
    setStatus('idle');
    setMessage('');
    if (!f.name.toLowerCase().endsWith('.zip')) {
      setStatus('error');
      setMessage('Solo se permiten archivos .zip');
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('uploading');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('start_date', startDate || '');
    formData.append('end_date', endDate || '');

    try {
      await axios.post('http://127.0.0.1:8000/api/v1/upload-zip/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch {
      // timeout is expected
    }

    setStatus('success');
    setMessage('El archivo se ha cargado exitosamente. Será procesado y recibirás una notificación cuando finalice.');
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-blue-200/50 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-blue-900">Carga de Reporte</h1>
          <p className="text-blue-500 mt-1">Sube tu archivo ZIP para procesar los gastos</p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : file
              ? 'border-blue-400 bg-blue-50/50'
              : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="space-y-2">
              <svg className="w-10 h-10 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-700 font-medium truncate px-4">{file.name}</p>
              <p className="text-blue-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setStatus('idle');
                  setMessage('');
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="text-sm text-blue-500 hover:text-blue-700 underline"
              >
                Cambiar archivo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <svg className="w-12 h-12 mx-auto text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-blue-600">
                <span className="font-semibold">Haz clic para examinar</span> o arrastra tu archivo aquí
              </p>
              <p className="text-blue-400 text-sm">Solo archivos .zip</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-blue-200 text-blue-900 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Fecha fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-blue-200 text-blue-900 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!file || status === 'uploading'}
          className="mt-4 w-full py-3 px-6 rounded-xl font-semibold text-white transition-all bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
        >
          {status === 'uploading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando...
            </span>
          ) : (
            'Procesar archivo'
          )}
        </button>

        {message && (
          <div
            className={`mt-4 p-4 rounded-xl text-center text-sm font-medium ${
              status === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
