"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  Film, 
  Palette, 
  BookOpen, 
  Users, 
  Play, 
  Pause, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Bot, 
  EyeOff, 
  Feather, 
  CheckCircle2, 
  Layers,
  Volume2,
  Tv
} from "lucide-react"
import { MenuBar, MenuBarItem } from "@/components/ui/bottom-menu"
import { MenuBarDemo, WorksWheelDemo } from "@/components/ui/demo"
import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { validateStoryContent, detectAutomatedBot, SafetyCheckResult } from "@/lib/safety-filter"

// Curated high quality anime-aesthetic stock images from Unsplash
const ANIME_STYLES = [
  {
    id: "shinkai",
    name: "Makoto Shinkai Sky",
    subtitle: "Ethereal luminous skies, photorealistic lighting & poignant drama",
    badge: "Cinema Realistic",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "ghibli",
    name: "Studio Ghibli Watercolor",
    subtitle: "Hand-painted nature, warm nostalgic whimsy & lush greenery",
    badge: "Organic Pastoral",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mappa",
    name: "MAPPA Dark Fantasy",
    subtitle: "High contrast, dynamic gritty lines & heart-pounding combat",
    badge: "Action Shonen",
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "kyoto",
    name: "Kyoto Animation Pastel",
    subtitle: "Subtle character expressions, soft lens flares & cherry blossoms",
    badge: "Slice of Life",
    image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80"
  }
]

const SAMPLE_STORIES = [
  {
    title: "The Clockmaker of Shibuya",
    text: "In the shadow of a neon Tokyo rainstorm, 17-year-old apprentice Ren discovers a brass pocket watch that pauses time for exactly thirty seconds. When a mysterious silver-haired girl runs through frozen raindrops seeking shelter, the gears of destiny lock into place."
  },
  {
    title: "Spirits of the Crimson Shrine",
    text: "Beneath the misty cedar canopies of Mount Hiei, young shrine keeper Aoi befriends an ancient fox spirit whose lantern guides wandering memories back to the mortal world before the twilight bells strike."
  },
  {
    title: "Aether Wing Vanguard",
    text: "High above the floating islands of Neo-Kyoto, rookie pilot Kaito syncs with his mecha unit during an unexpected rift disturbance, awakening an dormant celestial crystal that reshapes the northern horizon."
  }
]

export function StoryStudio() {
  const [activeTab, setActiveTab] = React.useState<"write" | "styles" | "cast" | "storyboard" | "player" | "safety" | "demo">("write")
  const [storyText, setStoryText] = React.useState(SAMPLE_STORIES[0].text)
  const [selectedStyle, setSelectedStyle] = React.useState(ANIME_STYLES[0].id)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentSceneIndex, setCurrentSceneIndex] = React.useState(0)
  const [safetyStatus, setSafetyStatus] = React.useState<SafetyCheckResult>({ isSafe: true, flaggedTerms: [] })
  const [isBotBlocked, setIsBotBlocked] = React.useState(false)

  // Real-time Content Moderation (NSFW & Nudity Restriction)
  React.useEffect(() => {
    const res = validateStoryContent(storyText)
    setSafetyStatus(res)
  }, [storyText])

  // Anti-AI Bot Detection Check
  React.useEffect(() => {
    if (detectAutomatedBot()) {
      setIsBotBlocked(true)
    }
  }, [])

  // Generated Scenes based on Story
  const scenes = [
    {
      time: "00:00 - 00:04",
      title: "Scene 1: Neon Downpour in Shibuya",
      desc: "Rain droplets cascade through glowing holographic billboards as Ren gazes at the clocktower.",
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
      audio: "Ambient synth rain & gentle piano chords"
    },
    {
      time: "00:04 - 00:08",
      title: "Scene 2: The Temporal Pocket Watch",
      desc: "Extreme close-up of intricate golden clockwork ticking into temporal suspension.",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
      audio: "Resonant clock chime and reverb echo"
    },
    {
      time: "00:08 - 00:14",
      title: "Scene 3: The Silver-Haired Encounter",
      desc: "Water drops suspended mid-air. Footsteps break the quiet stillness under the torii gate.",
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
      audio: "Strings crescendo into emotive theme"
    }
  ]

  const handleGenerate = () => {
    if (!safetyStatus.isSafe) return
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setActiveTab("storyboard")
    }, 1200)
  }

  // Floating Bottom Menu Bar items integrating the user's component
  const bottomNavItems: MenuBarItem[] = [
    {
      label: "Story Script",
      icon: (props) => <Feather {...(props as any)} />
    },
    {
      label: "Anime Styles",
      icon: (props) => <Palette {...(props as any)} />
    },
    {
      label: "Characters",
      icon: (props) => <Users {...(props as any)} />
    },
    {
      label: "Storyboard",
      icon: (props) => <Layers {...(props as any)} />
    },
    {
      label: "Anime Player",
      icon: (props) => <Film {...(props as any)} />
    },
    {
      label: "Safety Shield",
      icon: (props) => <ShieldCheck {...(props as any)} />
    },
    {
      label: "UI Demo",
      icon: (props) => <Tv {...(props as any)} />
    }
  ]

  const navTabMap: Array<"write" | "styles" | "cast" | "storyboard" | "player" | "safety" | "demo"> = [
    "write", "styles", "cast", "storyboard", "player", "safety", "demo"
  ]

  if (isBotBlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/40">
          <Bot className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-rose-400 mb-2">Automated Bot Scraping Prohibited</h1>
        <p className="text-slate-400 max-w-md text-sm mb-6">
          This system enforces strict anti-AI and anti-scraping policies. Headless webdrivers, scrapers, and automated AI scrapers are blocked.
        </p>
        <Button variant="outline" onClick={() => setIsBotBlocked(false)}>
          Verify as Human Otaku
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative pb-28 selection:bg-violet-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/15 rounded-full blur-[128px]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">Animorphia</span>
                <Badge variant="default" className="text-[10px] py-0 px-2">Studio 2.5</Badge>
              </div>
              <p className="text-[11px] text-slate-400">Story to Anime Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Nudity & Bot Shield Badges */}
            <div className="flex items-center gap-2">
              <Badge variant={safetyStatus.isSafe ? "success" : "destructive"} className="gap-1.5 py-1">
                {safetyStatus.isSafe ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">No-Nudity Guard: Active</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>NSFW Triggered</span>
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1 bg-slate-900/50 hidden md:flex">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Anti-AI Shield</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="max-w-5xl mx-auto px-6 pt-8 pb-12 w-full z-10 flex-1">
        {/* Navigation Tabs Pill Bar */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 backdrop-blur">
            {[
              { id: "write", label: "1. Story", icon: BookOpen },
              { id: "styles", label: "2. Anime Style", icon: Palette },
              { id: "cast", label: "3. Characters", icon: Users },
              { id: "storyboard", label: "4. Storyboard", icon: Layers },
              { id: "player", label: "5. Anime Preview", icon: Film },
              { id: "safety", label: "Safety Policy", icon: ShieldCheck },
              { id: "demo", label: "Component Demo", icon: Tv },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab 1: Story Writing & Content Moderation */}
        {activeTab === "write" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
            <Card className="border-slate-800/80 bg-slate-900/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Feather className="w-5 h-5 text-violet-400" />
                      Craft Your Story or Script
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                      Write your scene, novel excerpt, or anime synopsis. Our engine extracts scenes, character emotions, and art directions.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Presets:</span>
                    {SAMPLE_STORIES.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setStoryText(s.text)}
                        className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    rows={6}
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="Describe your story scene... (e.g. A swordsman standing beneath cherry blossoms as a storm approaches)"
                    className="font-normal leading-relaxed text-sm bg-slate-950/60 border-slate-800 focus-visible:ring-violet-500/50"
                  />
                  <div className="absolute right-3 bottom-3 text-[11px] text-slate-500">
                    {storyText.length} characters
                  </div>
                </div>

                {/* Nudity & NSFW Content Warning Banner */}
                <AnimatePresence>
                  {!safetyStatus.isSafe && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-3 text-xs"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-rose-200">Content Moderation Violation</p>
                        <p className="mt-0.5">{safetyStatus.reason}</p>
                        <p className="mt-1 text-rose-400/80">Please remove the restricted keywords to continue anime synthesis.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nudity & NSFW Protection Active (PG-13 / Family Safe)</span>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!safetyStatus.isSafe || isGenerating || !storyText.trim()}
                    className="gap-2 shadow-lg shadow-violet-500/20"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Anime Storyboard...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Anime Scenes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tab 2: Anime Styles */}
        {activeTab === "styles" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h2 className="text-xl font-bold text-white">Select Anime Visual Aesthetic</h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose the rendering engine and animation studio aesthetic for your anime story.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ANIME_STYLES.map((style) => {
                const isSelected = selectedStyle === style.id
                return (
                  <div
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all overflow-hidden relative group ${
                      isSelected
                        ? "border-violet-500 bg-violet-950/20 shadow-lg shadow-violet-500/10"
                        : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                    }`}
                  >
                    <div className="h-44 w-full rounded-lg overflow-hidden mb-3 relative">
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-3 left-3">
                        <Badge variant="outline" className="bg-slate-950/70 backdrop-blur text-[11px]">
                          {style.badge}
                        </Badge>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-base">{style.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{style.subtitle}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Characters & Cast */}
        {activeTab === "cast" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
            <Card className="border-slate-800/80 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Identified Cast & Character Profiles
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Extracted from your written story. Stylized character archetypes without clutter.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-4 items-center">
                  <img
                    src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=200&q=80"
                    alt="Protagonist"
                    className="w-16 h-16 rounded-xl object-cover border border-violet-500/40"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm">Ren Tachibana</h4>
                      <Badge variant="default" className="text-[10px]">Protagonist</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Quiet clockmaker apprentice, Shibuya district.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-4 items-center">
                  <img
                    src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=200&q=80"
                    alt="Heroine"
                    className="w-16 h-16 rounded-xl object-cover border border-cyan-500/40"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm">Mio Kisaragi</h4>
                      <Badge variant="outline" className="text-[10px]">Mysterious Fugitive</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Silver-haired girl holding an inverted temporal compass.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tab 4: Storyboard Scenes */}
        {activeTab === "storyboard" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Generated Anime Storyboard</h2>
                <p className="text-xs text-slate-400">Chronological keyframe sequence generated from your story script.</p>
              </div>
              <Button size="sm" onClick={() => setActiveTab("player")} className="gap-2">
                <Play className="w-3.5 h-3.5" />
                Watch Sequence
              </Button>
            </div>

            <div className="space-y-4">
              {scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col md:flex-row gap-5 items-center overflow-hidden"
                >
                  <div className="w-full md:w-56 h-32 rounded-lg overflow-hidden shrink-0 relative group">
                    <img
                      src={scene.image}
                      alt={scene.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] text-white font-mono">
                      {scene.time}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 text-left w-full">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-sm">{scene.title}</h4>
                      <Badge variant="outline" className="text-[10px]">Keyframe #{idx + 1}</Badge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{scene.desc}</p>
                    <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{scene.audio}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 5: Anime Player */}
        {activeTab === "player" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
            <Card className="border-slate-800/80 bg-slate-900/60 overflow-hidden">
              <div className="relative aspect-video w-full bg-black rounded-t-xl overflow-hidden flex items-center justify-center">
                <img
                  src={scenes[currentSceneIndex].image}
                  alt="Anime Playback"
                  className="w-full h-full object-cover transition-all duration-700 filter brightness-95"
                />
                
                {/* Cinema Overlay Subtitles */}
                <div className="absolute bottom-12 inset-x-0 text-center px-6 pointer-events-none">
                  <span className="inline-block bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-lg text-sm text-yellow-300 font-medium tracking-wide border border-white/10 shadow-lg">
                    {scenes[currentSceneIndex].desc}
                  </span>
                </div>

                {/* Player Controls Bar */}
                <div className="absolute bottom-0 inset-x-0 h-10 bg-slate-950/90 backdrop-blur flex items-center justify-between px-4 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-violet-400 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <span className="text-xs font-mono text-slate-400">
                      {scenes[currentSceneIndex].time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {scenes.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSceneIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          currentSceneIndex === i ? "w-6 bg-violet-500" : "w-2 bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>Export MP4</span>
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm">{scenes[currentSceneIndex].title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Rendered with {ANIME_STYLES.find(s => s.id === selectedStyle)?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentSceneIndex((prev) => (prev + 1) % scenes.length)}>
                    Next Cut
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tab 6: Safety Shield & Content Policy */}
        {activeTab === "safety" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
            <Card className="border-slate-800/80 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Family & Creative Safety Protection System
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Animorphia strictly enforces anti-nudity, anti-NSFW, and anti-AI-bot safeguards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-white font-medium text-sm mb-2">
                      <EyeOff className="w-4 h-4 text-violet-400" />
                      Zero-Tolerance Nudity & NSFW Policy
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Our system performs real-time keyword lexical analysis and semantic checks. Prompts or stories requesting nudity, explicit sexual imagery, or suggestive anatomy are instantly blocked before rendering.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-white font-medium text-sm mb-2">
                      <Bot className="w-4 h-4 text-cyan-400" />
                      Anti-AI Scraper & Bot Defense
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Equipped with <code className="text-[11px] text-cyan-300">robots.txt</code> restrictions, X-Robots-Tag headers (noai, noimageai), and client-side webdriver heuristic defense against unauthorized LLM scrapers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tab 7: Exact UI Component Demo */}
        {activeTab === "demo" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
            <Card className="border-slate-800/80 bg-slate-900/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Tv className="w-5 h-5 text-cyan-400" />
                      Works Wheel 3D Portfolio Index (WorksWheelDemo)
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                      Render of the requested <code className="text-violet-300">components/ui/works-wheel.tsx</code> and <code className="text-violet-300">components/ui/demo.tsx</code>. Scroll with mousewheel or drag to turn the 3D drum!
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-950/40">
                    Works '26 Anime Edition
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <WorksWheelDemo />
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-4 px-2">
                  <span>💡 <strong>Tip:</strong> Drag vertically or scroll mousewheel to spin the drum. Cards rotate in hard perspective.</span>
                  <span>Click any title on the right index to jump to a specific anime work.</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800/80 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-violet-400" />
                  Bottom Menu Bar (MenuBarDemo)
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Render of the animated tooltip <code className="text-violet-300">bottom-menu.tsx</code> component.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <MenuBarDemo />
                <p className="text-xs text-slate-400 mt-6">Hover over any icon above to test the animated tooltip positioning and spring transition.</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Floating Bottom Menu Bar Dock (User's Requested Component in Action) */}
      <footer className="fixed bottom-6 inset-x-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto shadow-2xl">
          <MenuBar
            items={bottomNavItems.map((item, idx) => ({
              ...item,
              icon: (props) => (
                <div onClick={() => setActiveTab(navTabMap[idx])}>
                  <item.icon {...props} />
                </div>
              )
            }))}
          />
        </div>
      </footer>
    </div>
  )
}
