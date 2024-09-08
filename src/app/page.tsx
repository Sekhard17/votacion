'use client'

import React, { useState, useEffect } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from 'react-chartjs-2'
import { Dialog, Transition } from '@headlessui/react'
import { X, Check, AlertCircle, User, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

ChartJS.register(ArcElement, Tooltip, Legend)

export default function Votacion() {
  const [votos, setVotos] = useState<{ favor: number; contra: number }>({ favor: 0, contra: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [voto, setVoto] = useState<'favor' | 'contra' | null>(null)
  const [error, setError] = useState('')
  const [isMounted, setIsMounted] = useState(false) // Nuevo estado para verificar si el componente está montado

  useEffect(() => {
    // Solo accede a localStorage después de que el componente esté montado
    setIsMounted(true)
    const savedVotos = localStorage.getItem('votos')
    if (savedVotos) {
      setVotos(JSON.parse(savedVotos))
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('votos', JSON.stringify(votos))
    }
  }, [votos, isMounted])

  const handleVotar = () => {
    if (!nombre || !voto) {
      setError('Por favor, complete todos los campos')
      return
    }

    setVotos((prevVotos) => ({
      ...prevVotos,
      [voto]: prevVotos[voto] + 1
    }))
    setIsModalOpen(false)
    setNombre('')
    setVoto(null)
    setError('')
  }

  const data = {
    labels: ['A favor', 'En contra'],
    datasets: [
      {
        data: [votos.favor, votos.contra],
        backgroundColor: ['#10B981', '#EF4444'],
        hoverBackgroundColor: ['#059669', '#DC2626']
      }
    ]
  }

  if (!isMounted) {
    // Muestra un loading o valores temporales hasta que el componente esté montado
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Votación</h1>
          <h2 className="text-xl text-center text-gray-600 mb-8">Innovación y Emprendimiento - B50-N4-P12-C1</h2>

          <div className="mb-8">
            <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>

          <div className="flex justify-center space-x-8 mb-8">
            <span className="flex items-center text-lg font-medium text-green-600">
              <ThumbsUp className="w-6 h-6 mr-2" />
              A favor: {votos.favor}
            </span>
            <span className="flex items-center text-lg font-medium text-red-600">
              <ThumbsDown className="w-6 h-6 mr-2" />
              En contra: {votos.contra}
            </span>
          </div>

          <div className="flex justify-center">
            <Button onClick={() => setIsModalOpen(true)} className="px-6 py-3 text-lg">
              Emitir Voto
            </Button>
          </div>
        </div>
      </div>

      <Transition appear show={isModalOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center mb-4"
                  >
                    Emitir voto
                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                        Nombre completo
                      </Label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="text"
                          id="nombre"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          className="pl-10"
                          placeholder="Ingrese su nombre"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Su voto</Label>
                      <RadioGroup value={voto ?? undefined} onValueChange={(value) => setVoto(value as 'favor' | 'contra')}>
                        <div className="flex space-x-4 mt-1">
                          <div className="flex items-center">
                            <RadioGroupItem value="favor" id="favor" />
                            <Label htmlFor="favor" className="ml-2">A favor</Label>
                          </div>
                          <div className="flex items-center">
                            <RadioGroupItem value="contra" id="contra" />
                            <Label htmlFor="contra" className="ml-2">En contra</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-2 text-red-500 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      {error}
                    </div>
                  )}

                  <div className="mt-6">
                    <Button onClick={handleVotar} className="w-full">
                      <Check className="h-5 w-5 mr-2" />
                      Emitir voto
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
