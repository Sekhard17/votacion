'use client'

import React, { useState, useEffect } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from 'react-chartjs-2'
import { Dialog, Transition } from '@headlessui/react'
import { X, Check, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

ChartJS.register(ArcElement, Tooltip, Legend)

type VoteType = 'favor' | 'contra'

export default function AnonymousVoting() {
  const [votes, setVotes] = useState<{ favor: number; contra: number }>({ favor: 0, contra: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [vote, setVote] = useState<VoteType | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVotes()
    const subscription = supabase
      .channel('votes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, fetchVotes)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchVotes = async () => {
    const { data, error } = await supabase
      .from('votes')
      .select('type')

    if (error) {
      console.error('Error fetching votes:', error)
      return
    }

    const voteCount = data.reduce((acc, vote) => {
      acc[vote.type as VoteType] += 1
      return acc
    }, { favor: 0, contra: 0 })

    setVotes(voteCount)
    setIsLoading(false)
  }

  const handleVote = async () => {
    if (!vote) {
      setError('Por favor, seleccione una opción')
      return
    }

    const { error } = await supabase
      .from('votes')
      .insert({ type: vote })

    if (error) {
      console.error('Error submitting vote:', error)
      setError('Hubo un error al emitir su voto. Por favor, intente nuevamente.')
      return
    }

    setIsModalOpen(false)
    setVote(null)
    setError('')
  }

  const data = {
    labels: ['A favor', 'En contra'],
    datasets: [
      {
        data: [votes.favor, votes.contra],
        backgroundColor: ['#10B981', '#EF4444'],
        hoverBackgroundColor: ['#059669', '#DC2626']
      }
    ]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Votación Anónima</h1>
          <h2 className="text-xl text-center text-gray-600 mb-8">Innovación y Emprendimiento - B50-N4-P12-C1</h2>
          <h2 className="text-xl text-center text-gray-600 mb-8">¿Estás de acuerdo con cambiar al profesor?</h2>

          <div className="mb-8 h-64">
            <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>

          <div className="flex justify-center space-x-8 mb-8">
            <span className="flex items-center text-lg font-medium text-green-600">
              <ThumbsUp className="w-6 h-6 mr-2" />
              A favor: {votes.favor}
            </span>
            <span className="flex items-center text-lg font-medium text-red-600">
              <ThumbsDown className="w-6 h-6 mr-2" />
              En contra: {votes.contra}
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
                    Emitir voto anónimo
                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Su voto</Label>
                      <RadioGroup value={vote ?? undefined} onValueChange={(value) => setVote(value as VoteType)}>
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
                    <Button onClick={handleVote} className="w-full">
                      <Check className="h-5 w-5 mr-2" />
                      Emitir voto anónimo
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