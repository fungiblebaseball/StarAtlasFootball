import { useState, useEffect } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { CrewCard, CompactCrewCard } from "./components/crew-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link } from "wouter"
import { Save, Loader2, Filter } from "lucide-react"

interface ApiCrewMember {
  _id: string
  mintOffset: number
  name: string
  imageUrl: string
  faction: string
  species: string
  sex: string
  university: string
  age: number
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  rarity: string
  aptitudes: Record<string, string>
}

interface Player {
  id: string
  name: string
  number: number
  position: string
  photo: string
  attributes: {
    playmakerCreativity: number
    tacticalAwareness: number
    physicalStrength: number
    technicalSkill: number
    mentalResilience: number
  }
  rarity: string
  species: string
  faction: string
}

const convertApiToPlayer = (crew: ApiCrewMember, index: number): Player => {
  // Determine position based on aptitudes
  const aptitudes = Object.keys(crew.aptitudes)
  let position = "MID" // default

  if (aptitudes.includes("Flight")) position = "ATT"
  else if (aptitudes.includes("Command") || aptitudes.includes("Operator")) position = "MID"
  else if (aptitudes.includes("Engineering") || aptitudes.includes("Fitness")) position = "DEF"
  else if (aptitudes.includes("Medical")) position = "GK"

  return {
    id: crew._id,
    name: crew.name,
    number: index + 1,
    position,
    photo: crew.imageUrl,
    rarity: crew.rarity,
    species: crew.species,
    faction: crew.faction,
    attributes: {
      playmakerCreativity: Math.round(crew.openness * 100),
      tacticalAwareness: Math.round(crew.conscientiousness * 100),
      physicalStrength: Math.round(crew.extraversion * 100),
      technicalSkill: Math.round(crew.agreeableness * 100),
      mentalResilience: Math.round((1 - crew.neuroticism) * 100),
    },
  }
}

export default function RosterPage() {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const [filterAttribute, setFilterAttribute] = useState<string>("all")
  const [filterPosition, setFilterPosition] = useState<string>("all")
  const [searchName, setSearchName] = useState<string>("")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const response = await fetch(
          "https://galaxy.staratlas.com/crew/inventory/B9JCkYPmqCeBzVGNq6jXqXnFqazrCTUSvD4Kd4HTTH3m",
        )
        const data = await response.json()

        const players = data.crew.map((crew: ApiCrewMember, index: number) => convertApiToPlayer(crew, index))

        // Load saved squad from localStorage or use first 15
        const savedSquad = localStorage.getItem("selectedSquad")
        if (savedSquad) {
          const savedIds = JSON.parse(savedSquad).map((p: Player) => p.id)
          const selected = players.filter((p: Player) => savedIds.includes(p.id))
          const available = players.filter((p: Player) => !savedIds.includes(p.id))
          setSelectedPlayers(selected)
          setAvailablePlayers(available)
        } else {
          setSelectedPlayers(players.slice(0, 15))
          setAvailablePlayers(players.slice(15))
        }
      } catch (error) {
        console.error("[v0] Error fetching crew:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCrew()
  }, [])

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    // Check if dropping on a position slot
    if (typeof overId === "string" && overId.startsWith("slot-")) {
      const slotIndex = Number.parseInt(overId.replace("slot-", ""))
      const activePlayer =
        selectedPlayers.find((p) => p.id === activeId) || availablePlayers.find((p) => p.id === activeId)

      if (!activePlayer) return

      if (selectedPlayers.find((p) => p.id === activeId)) {
        // Moving within selected - swap positions
        const currentIndex = selectedPlayers.findIndex((p) => p.id === activeId)
        const newSelected = [...selectedPlayers]

        if (slotIndex < selectedPlayers.length) {
          // Swap with existing player
          const temp = newSelected[slotIndex]
          newSelected[slotIndex] = newSelected[currentIndex]
          newSelected[currentIndex] = temp
        } else {
          // Move to empty slot
          newSelected.splice(currentIndex, 1)
          newSelected.splice(slotIndex, 0, activePlayer)
        }

        setSelectedPlayers(newSelected)
      } else {
        // Moving from available to selected
        if (selectedPlayers.length >= 15) {
          // Replace player at slot
          const newSelected = [...selectedPlayers]
          const replacedPlayer = newSelected[slotIndex]
          newSelected[slotIndex] = activePlayer
          setSelectedPlayers(newSelected)
          setAvailablePlayers(availablePlayers.filter((p) => p.id !== activeId).concat(replacedPlayer))
        } else {
          // Add to slot
          const newSelected = [...selectedPlayers]
          newSelected.splice(slotIndex, 0, activePlayer)
          setSelectedPlayers(newSelected.slice(0, 15))
          setAvailablePlayers(availablePlayers.filter((p) => p.id !== activeId))
        }
      }
      return
    }

    // Find which list the active item is in
    const activeInSelected = selectedPlayers.find((p) => p.id === activeId)
    const activeInAvailable = availablePlayers.find((p) => p.id === activeId)
    const overInSelected = selectedPlayers.find((p) => p.id === overId)
    const overInAvailable = availablePlayers.find((p) => p.id === overId)

    if (activeInSelected && overInSelected) {
      // Swap positions within selected
      const activeIndex = selectedPlayers.findIndex((p) => p.id === activeId)
      const overIndex = selectedPlayers.findIndex((p) => p.id === overId)
      const newSelected = [...selectedPlayers]
      const temp = newSelected[activeIndex]
      newSelected[activeIndex] = newSelected[overIndex]
      newSelected[overIndex] = temp
      setSelectedPlayers(newSelected)
    } else if (activeInAvailable && overInAvailable) {
      // Reorder within available (no number change needed)
      const oldIndex = availablePlayers.findIndex((p) => p.id === activeId)
      const newIndex = availablePlayers.findIndex((p) => p.id === overId)
      const newAvailable = [...availablePlayers]
      const [removed] = newAvailable.splice(oldIndex, 1)
      newAvailable.splice(newIndex, 0, removed)
      setAvailablePlayers(newAvailable)
    } else if (activeInAvailable && overInSelected) {
      // Swap: available player takes selected player's position
      const player = availablePlayers.find((p) => p.id === activeId)
      const overPlayer = selectedPlayers.find((p) => p.id === overId)
      if (player && overPlayer) {
        const overIndex = selectedPlayers.findIndex((p) => p.id === overId)
        const newSelected = [...selectedPlayers]
        newSelected[overIndex] = player
        const newAvailable = availablePlayers.filter((p) => p.id !== activeId).concat(overPlayer)
        setSelectedPlayers(newSelected)
        setAvailablePlayers(newAvailable)
      }
    } else if (activeInSelected && overInAvailable) {
      // Swap: selected player goes to available
      const player = selectedPlayers.find((p) => p.id === activeId)
      const overPlayer = availablePlayers.find((p) => p.id === overId)
      if (player && overPlayer) {
        const activeIndex = selectedPlayers.findIndex((p) => p.id === activeId)
        const newSelected = [...selectedPlayers]
        newSelected[activeIndex] = overPlayer
        const newAvailable = availablePlayers.filter((p) => p.id !== overId).concat(player)
        setSelectedPlayers(newSelected)
        setAvailablePlayers(newAvailable)
      }
    } else if (activeInSelected && over.id === "available-zone") {
      // Drop into available zone
      const player = selectedPlayers.find((p) => p.id === activeId)
      if (player) {
        setSelectedPlayers(selectedPlayers.filter((p) => p.id !== activeId))
        setAvailablePlayers([...availablePlayers, player])
      }
    } else if (activeInAvailable && over.id === "selected-zone") {
      // Drop into selected zone
      if (selectedPlayers.length < 15) {
        const player = availablePlayers.find((p) => p.id === activeId)
        if (player) {
          setAvailablePlayers(availablePlayers.filter((p) => p.id !== activeId))
          setSelectedPlayers([...selectedPlayers, player])
        }
      }
    }
  }

  const removePlayer = (playerId: string) => {
    const player = selectedPlayers.find((p) => p.id === playerId)
    if (player) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== playerId))
      setAvailablePlayers([...availablePlayers, player])
    }
  }

  const addPlayer = (playerId: string) => {
    if (selectedPlayers.length >= 15) return
    const player = availablePlayers.find((p) => p.id === playerId)
    if (player) {
      setAvailablePlayers(availablePlayers.filter((p) => p.id !== playerId))
      setSelectedPlayers([...selectedPlayers, player])
    }
  }

  const saveSquad = () => {
    localStorage.setItem("selectedSquad", JSON.stringify(selectedPlayers))
    alert("Squad saved successfully!")
  }

  const getFormationRows = () => {
    const rows = []
    let currentIndex = 0

    // Row 1: Goalkeeper (position 1)
    rows.push({
      title: "Goalkeeper",
      positions: selectedPlayers.slice(currentIndex, currentIndex + 1),
      startIndex: currentIndex,
      count: 1,
    })
    currentIndex += 1

    // Row 2: Defenders (positions 2-5)
    rows.push({
      title: "Defenders",
      positions: selectedPlayers.slice(currentIndex, currentIndex + 4),
      startIndex: currentIndex,
      count: 4,
    })
    currentIndex += 4

    // Row 3: Midfielders (positions 6-9)
    rows.push({
      title: "Midfielders",
      positions: selectedPlayers.slice(currentIndex, currentIndex + 4),
      startIndex: currentIndex,
      count: 4,
    })
    currentIndex += 4

    // Row 4: Attackers (positions 10-11)
    rows.push({
      title: "Attackers",
      positions: selectedPlayers.slice(currentIndex, currentIndex + 2),
      startIndex: currentIndex,
      count: 2,
    })
    currentIndex += 2

    // Row 5: Reserves (positions 12-15)
    rows.push({
      title: "Reserves",
      positions: selectedPlayers.slice(currentIndex, currentIndex + 4),
      startIndex: currentIndex,
      count: 4,
    })

    return rows
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white text-xl">Loading crew members...</p>
        </div>
      </div>
    )
  }

  const activePlayer = activeId
    ? selectedPlayers.find((p) => p.id === activeId) || availablePlayers.find((p) => p.id === activeId)
    : null

  const formationRows = getFormationRows()

  const filteredAvailablePlayers = availablePlayers.filter((player) => {
    // Name search
    if (searchName && !player.name.toLowerCase().includes(searchName.toLowerCase())) {
      return false
    }

    // Position filter
    if (filterPosition !== "all" && player.position !== filterPosition) {
      return false
    }

    // Attribute filter (show players with high values in selected attribute)
    if (filterAttribute !== "all") {
      const attrValue = player.attributes[filterAttribute as keyof Player["attributes"]]
      if (attrValue < 70) return false // Only show players with 70+ in selected attribute
    }

    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Team Roster</h1>
            <p className="text-blue-200">Select 15 players for your squad (11 starters + 4 reserves)</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={saveSquad} className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              Save Squad
            </Button>
            <Link href="/squad">
              <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-950 bg-transparent">
                View Squad
              </Button>
            </Link>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Selected Squad ({selectedPlayers.length}/15)</h2>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white border-2 border-gray-300" />
                  <span className="text-gray-300">GK</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-orange-500" />
                  <span className="text-gray-300">DEF</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-500" />
                  <span className="text-gray-300">MID</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-500" />
                  <span className="text-gray-300">ATT</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-yellow-400" />
                  <span className="text-gray-300">Reserves</span>
                </div>
              </div>
            </div>

            {/* Formation Rows */}
            <div className="space-y-4">
              {formationRows.map((row, rowIndex) => (
                <div key={rowIndex} className="bg-slate-800/50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-white mb-2">{row.title}</h3>
                  <SortableContext
                    items={row.positions.map((p) => p?.id || `slot-${row.startIndex}`)}
                    strategy={rectSortingStrategy}
                  >
                    <div
                      className={`grid gap-3 ${
                        row.count === 1
                          ? "grid-cols-1 max-w-xs mx-auto"
                          : row.count === 2
                            ? "grid-cols-2 max-w-md mx-auto"
                            : row.count === 4
                              ? "grid-cols-4"
                              : "grid-cols-5"
                      }`}
                    >
                      {Array.from({ length: row.count }).map((_, index) => {
                        const positionIndex = row.startIndex + index
                        const player = row.positions[index]
                        const slotId = `slot-${positionIndex}`

                        return (
                          <div key={slotId} className="relative">
                            {player ? (
                              <CrewCard
                                player={player}
                                positionNumber={positionIndex + 1}
                                isReserve={positionIndex >= 11}
                                onRemove={() => removePlayer(player.id)}
                              />
                            ) : (
                              <div
                                id={slotId}
                                className="h-[100px] border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center bg-slate-800/30"
                              >
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-slate-600 mb-1">{positionIndex + 1}</div>
                                  <div className="text-xs text-slate-500">Empty</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Available Players ({filteredAvailablePlayers.length})</h2>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 flex gap-4 items-center">
              <Filter className="h-5 w-5 text-blue-400" />
              <Input
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="max-w-xs bg-slate-900 border-slate-700 text-white"
              />
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="GK">Goalkeeper</SelectItem>
                  <SelectItem value="DEF">Defender</SelectItem>
                  <SelectItem value="MID">Midfielder</SelectItem>
                  <SelectItem value="ATT">Attacker</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAttribute} onValueChange={setFilterAttribute}>
                <SelectTrigger className="w-52 bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Filter by attribute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Attributes</SelectItem>
                  <SelectItem value="playmakerCreativity">High Playmaker Creativity</SelectItem>
                  <SelectItem value="tacticalAwareness">High Tactical Awareness</SelectItem>
                  <SelectItem value="physicalStrength">High Physical Strength</SelectItem>
                  <SelectItem value="technicalSkill">High Technical Skill</SelectItem>
                  <SelectItem value="mentalResilience">High Mental Resilience</SelectItem>
                </SelectContent>
              </Select>
              {(searchName || filterPosition !== "all" || filterAttribute !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchName("")
                    setFilterPosition("all")
                    setFilterAttribute("all")
                  }}
                  className="border-slate-700 text-slate-300"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <p className="text-blue-200 mb-4 text-sm">Drag players to squad positions above</p>
            <SortableContext items={filteredAvailablePlayers.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="space-y-2" id="available-zone">
                {filteredAvailablePlayers.map((player) => (
                  <CompactCrewCard key={player.id} player={player} onAdd={() => addPlayer(player.id)} />
                ))}
              </div>
            </SortableContext>
          </div>

          <DragOverlay>
            {activePlayer ? (
              <div className="opacity-80">
                {selectedPlayers.find((p) => p.id === activePlayer.id) ? (
                  <CrewCard player={activePlayer} positionNumber={0} />
                ) : (
                  <CompactCrewCard player={activePlayer} />
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
