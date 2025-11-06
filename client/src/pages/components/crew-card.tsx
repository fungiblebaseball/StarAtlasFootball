"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PlayerAttributes {
  playmakerCreativity: number
  tacticalAwareness: number
  physicalStrength: number
  technicalSkill: number
  mentalResilience: number
  total: number
  average: number
}

interface Player {
  id: string
  name: string
  number: number
  position: string
  photo: string
  attributes: PlayerAttributes
  rarity?: string
  species?: string
  faction?: string
}

interface CrewCardProps {
  player: Player
  positionNumber?: number
  isReserve?: boolean
  isAvailable?: boolean
  onRemove?: () => void
  onAdd?: () => void
}

interface CompactCrewCardProps {
  player: Player
  onAdd?: () => void
}

export function CrewCard({
  player,
  positionNumber,
  isReserve = false,
  isAvailable = false,
  onRemove,
  onAdd,
}: CrewCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getNumberBgColor = () => {
    if (!positionNumber) return "bg-gray-500 text-white"
    if (positionNumber >= 12) return "bg-yellow-400 text-black"
    if (positionNumber === 1) return "bg-white text-black"
    if (positionNumber >= 2 && positionNumber <= 5) return "bg-orange-500 text-white"
    if (positionNumber >= 6 && positionNumber <= 9) return "bg-red-500 text-white"
    if (positionNumber >= 10 && positionNumber <= 11) return "bg-blue-500 text-white"
    return "bg-gray-500 text-white"
  }

  const getRarityColor = () => {
    if (!player.rarity) return "border-slate-700"
    switch (player.rarity.toLowerCase()) {
      case "legendary":
        return "border-yellow-500"
      case "epic":
        return "border-purple-500"
      case "rare":
        return "border-blue-500"
      case "uncommon":
        return "border-green-500"
      default:
        return "border-slate-700"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card
              className={`relative overflow-hidden cursor-move hover:shadow-xl transition-shadow bg-slate-800 border-2 ${getRarityColor()} h-[100px] flex items-center`}
            >
              {isAvailable && onAdd && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 right-1 z-10 h-5 w-5 bg-green-500/80 hover:bg-green-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAdd()
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
              {!isAvailable && onRemove && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 right-1 z-10 h-5 w-5 bg-red-500/80 hover:bg-red-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}

              <div className="flex items-center gap-2 w-full h-full p-2">
                {/* Position number badge */}
                {positionNumber !== undefined && positionNumber > 0 && (
                  <div
                    className={`w-8 h-8 rounded-full ${getNumberBgColor()} flex items-center justify-center font-bold text-sm shadow-lg flex-shrink-0`}
                  >
                    {positionNumber}
                  </div>
                )}

                {/* Photo */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700 flex-shrink-0">
                  <img
                    src={player.photo || "/placeholder.svg"}
                    alt={player.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Player info and attributes */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-white font-bold text-xs truncate">{player.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-blue-300 text-xs font-semibold">{player.position}</span>
                    {player.rarity && <span className="text-xs text-gray-400 truncate">{player.rarity}</span>}
                  </div>
                  <div className="flex gap-1.5 mt-1 text-[10px]">
                    <div className="text-center">
                      <div className="text-gray-400">PMC</div>
                      <div className="text-white font-semibold">{player.attributes.playmakerCreativity}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">TAW</div>
                      <div className="text-white font-semibold">{player.attributes.tacticalAwareness}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">PHS</div>
                      <div className="text-white font-semibold">{player.attributes.physicalStrength}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">TEC</div>
                      <div className="text-white font-semibold">{player.attributes.technicalSkill}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">MNT</div>
                      <div className="text-white font-semibold">{player.attributes.mentalResilience}</div>
                    </div>
                    <div className="text-center px-1 border-l border-slate-600">
                      <div className="text-gray-400">AVG</div>
                      <div className="text-yellow-400 font-bold">{player.attributes.average}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-800 border-slate-700 p-4 max-w-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-white mb-3">{player.name}</h4>
            {player.faction && (
              <div className="text-xs text-gray-400 mb-2">
                {player.faction} • {player.species}
              </div>
            )}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Playmaker Creativity:</span>
                <span className="text-white font-semibold">{player.attributes.playmakerCreativity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Tactical Awareness:</span>
                <span className="text-white font-semibold">{player.attributes.tacticalAwareness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Physical Strength:</span>
                <span className="text-white font-semibold">{player.attributes.physicalStrength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Technical Skill:</span>
                <span className="text-white font-semibold">{player.attributes.technicalSkill}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Mental Resilience:</span>
                <span className="text-white font-semibold">{player.attributes.mentalResilience}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function CompactCrewCard({ player, onAdd }: CompactCrewCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getRarityColor = () => {
    if (!player.rarity) return "border-slate-700"
    switch (player.rarity.toLowerCase()) {
      case "legendary":
        return "border-yellow-500"
      case "epic":
        return "border-purple-500"
      case "rare":
        return "border-blue-500"
      case "uncommon":
        return "border-green-500"
      default:
        return "border-slate-700"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div
              className={`h-12 flex items-center gap-3 px-3 bg-slate-800 border-l-4 ${getRarityColor()} rounded cursor-move hover:bg-slate-700 transition-colors`}
            >
              {/* Photo on the left */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-600 flex-shrink-0">
                <img
                  src={player.photo || "/placeholder.svg"}
                  alt={player.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{player.name}</p>
                <p className="text-gray-400 text-xs">{player.species}</p>
              </div>

              {/* Attributes to the right */}
              <div className="flex items-center gap-2 text-xs">
                <div className="text-center">
                  <div className="text-gray-400">PMC</div>
                  <div className="text-white font-semibold">{player.attributes.playmakerCreativity}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">TAW</div>
                  <div className="text-white font-semibold">{player.attributes.tacticalAwareness}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">PHS</div>
                  <div className="text-white font-semibold">{player.attributes.physicalStrength}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">TEC</div>
                  <div className="text-white font-semibold">{player.attributes.technicalSkill}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">MNT</div>
                  <div className="text-white font-semibold">{player.attributes.mentalResilience}</div>
                </div>
              </div>

              {/* Add button */}
              {onAdd && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-green-500/80 hover:bg-green-600 text-white flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAdd()
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-800 border-slate-700 p-4 max-w-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-white mb-3">{player.name}</h4>
            {player.faction && (
              <div className="text-xs text-gray-400 mb-2">
                {player.faction} • {player.species}
              </div>
            )}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Playmaker Creativity:</span>
                <span className="text-white font-semibold">{player.attributes.playmakerCreativity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Tactical Awareness:</span>
                <span className="text-white font-semibold">{player.attributes.tacticalAwareness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Physical Strength:</span>
                <span className="text-white font-semibold">{player.attributes.physicalStrength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Technical Skill:</span>
                <span className="text-white font-semibold">{player.attributes.technicalSkill}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Mental Resilience:</span>
                <span className="text-white font-semibold">{player.attributes.mentalResilience}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
