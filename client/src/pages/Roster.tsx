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
import { useWallet } from "@/lib/wallet-context"
import { useQuery } from "@tanstack/react-query"
import type { PlayerProfile } from "../../../shared/schema"

interface ApiCrewMember {
  dasID: string
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
    total: number
    average: number
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

  const playmakerCreativity = Math.round(crew.openness * 100)
  const tacticalAwareness = Math.round(crew.conscientiousness * 100)
  const physicalStrength = Math.round(crew.extraversion * 100)
  const technicalSkill = Math.round(crew.agreeableness * 100)
  const mentalResilience = Math.round((1 - crew.neuroticism) * 100)
  
  const total = playmakerCreativity + tacticalAwareness + physicalStrength + technicalSkill + mentalResilience
  const average = Math.round(total / 5)

  return {
    id: crew.dasID,
    name: crew.name,
    number: index + 1,
    position,
    photo: crew.imageUrl,
    rarity: crew.rarity,
    species: crew.species,
    faction: crew.faction,
    attributes: {
      playmakerCreativity,
      tacticalAwareness,
      physicalStrength,
      technicalSkill,
      mentalResilience,
      total,
      average,
    },
  }
}

export default function RosterPage() {
  const { walletAddress, connected } = useWallet()
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [clickedPlayerId, setClickedPlayerId] = useState<string | null>(null)

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

  // Fetch player profile
  const { data: profile } = useQuery<PlayerProfile>({
    queryKey: ["/api/profile", walletAddress],
    enabled: !!walletAddress,
  })

  // Fetch crew from database (cached crew)
  const { data: crewData, isLoading } = useQuery<{ total: number; crew: ApiCrewMember[] }>({
    queryKey: ["/api/crew/cached"],
    enabled: !!profile,
  })

  useEffect(() => {
    if (!crewData || !profile) return

    const players = crewData.crew.map((crew: ApiCrewMember, index: number) => convertApiToPlayer(crew, index))

    // Get selected crew IDs from profile
    const selectedIds = (profile.selectedCrewIds as string[]) || []
    
    if (selectedIds.length > 0) {
      // Use profile's selected crew - preserve order from selectedIds
      const selected = selectedIds
        .map((id: string) => players.find((p: Player) => p.id === id))
        .filter((p): p is Player => p !== undefined) // Filter out undefined and provide type guard
      
      const available = players.filter((p: Player) => !selectedIds.includes(p.id))
      setSelectedPlayers(selected)
      setAvailablePlayers(available)
    } else {
      // Fallback: use first 15
      setSelectedPlayers(players.slice(0, 15))
      setAvailablePlayers(players.slice(15))
    }
  }, [crewData, profile])

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

  const handleCardClick = (playerId: string) => {
    if (!clickedPlayerId) {
      // First click: select this card
      setClickedPlayerId(playerId)
    } else if (clickedPlayerId === playerId) {
      // Clicking same card: deselect
      setClickedPlayerId(null)
    } else {
      // Second click: swap positions
      const firstPlayer = selectedPlayers.find((p) => p.id === clickedPlayerId)
      const secondPlayer = selectedPlayers.find((p) => p.id === playerId)

      if (firstPlayer && secondPlayer) {
        // Both in selected squad: swap
        const firstIndex = selectedPlayers.findIndex((p) => p.id === clickedPlayerId)
        const secondIndex = selectedPlayers.findIndex((p) => p.id === playerId)
        const newSelected = [...selectedPlayers]
        newSelected[firstIndex] = secondPlayer
        newSelected[secondIndex] = firstPlayer
        setSelectedPlayers(newSelected)
      }
      
      setClickedPlayerId(null)
    }
  }

  const saveSquad = () => {
    localStorage.setItem("selectedSquad", JSON.stringify(selectedPlayers))
    alert("Squad saved successfully!")
  }

  const calculateCompartmentValue = (players: Player[]) => {
    if (players.length === 0) return 0
    return players.reduce((sum, p) => sum + p.attributes.average, 0)
  }

  const getFormationRows = () => {
    const rows = []
    let currentIndex = 0

    // Row 1: Goalkeeper (position 1)
    const gkPlayers = selectedPlayers.slice(currentIndex, currentIndex + 1)
    rows.push({
      title: "Goalkeeper",
      positions: gkPlayers,
      startIndex: currentIndex,
      count: 1,
      value: calculateCompartmentValue(gkPlayers),
    })
    currentIndex += 1

    // Row 2: Defenders (positions 2-5)
    const defPlayers = selectedPlayers.slice(currentIndex, currentIndex + 4)
    rows.push({
      title: "Defenders",
      positions: defPlayers,
      startIndex: currentIndex,
      count: 4,
      value: calculateCompartmentValue(defPlayers),
    })
    currentIndex += 4

    // Row 3: Midfielders (positions 6-9)
    const midPlayers = selectedPlayers.slice(currentIndex, currentIndex + 4)
    rows.push({
      title: "Midfielders",
      positions: midPlayers,
      startIndex: currentIndex,
      count: 4,
      value: calculateCompartmentValue(midPlayers),
    })
    currentIndex += 4

    // Row 4: Attackers (positions 10-11)
    const attPlayers = selectedPlayers.slice(currentIndex, currentIndex + 2)
    rows.push({
      title: "Attackers",
      positions: attPlayers,
      startIndex: currentIndex,
      count: 2,
      value: calculateCompartmentValue(attPlayers),
    })
    currentIndex += 2

    // Row 5: Reserves (positions 12-15)
    const resPlayers = selectedPlayers.slice(currentIndex, currentIndex + 4)
    rows.push({
      title: "Reserves",
      positions: resPlayers,
      startIndex: currentIndex,
      count: 4,
      value: calculateCompartmentValue(resPlayers),
    })

    return rows
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white text-xl">Loading crew members...</p>
        </div>
      </div>
    )
  }
  
  const teamName = profile.profileName || profile.teamName || "My Team"

  const activePlayer = activeId
    ? selectedPlayers.find((p) => p.id === activeId) || availablePlayers.find((p) => p.id === activeId)
    : null

  const formationRows = getFormationRows()

  // Filter and sort available players
  const filteredAvailablePlayers = availablePlayers
    .filter((player) => {
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
    .sort((a, b) => {
      // Sort by selected attribute in descending order if one is selected
      if (filterAttribute !== "all") {
        const attrA = a.attributes[filterAttribute as keyof Player["attributes"]]
        const attrB = b.attributes[filterAttribute as keyof Player["attributes"]]
        return attrB - attrA // Higher values first
      }
      return 0 // Maintain original order if no attribute filter
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{teamName} - Roster</h1>
            <p className="text-blue-200">Select 15 players for your squad (11 starters + 4 reserves)</p>
            {profile.profileName && (
              <p className="text-sm text-blue-300 mt-1">Profile: {profile.profileName}</p>
            )}
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
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-white">{row.title}</h3>
                    <div className="text-sm font-bold text-yellow-400">
                      Total: {Math.round(row.value)}
                    </div>
                  </div>
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
                              <div 
                                onClick={() => handleCardClick(player.id)}
                                className={`cursor-pointer transition-all ${
                                  clickedPlayerId === player.id 
                                    ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900 rounded-lg' 
                                    : ''
                                }`}
                              >
                                <CrewCard
                                  player={player}
                                  positionNumber={positionIndex + 1}
                                  isReserve={positionIndex >= 11}
                                  onRemove={() => removePlayer(player.id)}
                                />
                              </div>
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
                  <SelectItem value="total">High Total Stats</SelectItem>
                  <SelectItem value="average">High Average Stats</SelectItem>
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
