import os
import wave
import struct
import math

SAMPLE_RATE = 44100

def create_track(filename, duration, bpm, generator_func):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    num_samples = int(SAMPLE_RATE * duration)
    with wave.open(filename, 'w') as wav:
        wav.setnchannels(2)  # Stereo
        wav.setsampwidth(2)  # 16-bit
        wav.setframerate(SAMPLE_RATE)
        
        frames = bytearray()
        beat_interval = 60.0 / bpm
        sixteenth = beat_interval / 4.0
        
        for i in range(num_samples):
            t = i / SAMPLE_RATE
            left, right = generator_func(t, beat_interval, sixteenth)
            
            # Master soft clip limiter
            left = max(-0.95, min(0.95, left))
            right = max(-0.95, min(0.95, right))
            
            # Convert to 16-bit PCM integer
            left_int = int(left * 32767.0)
            right_int = int(right * 32767.0)
            
            frames.extend(struct.pack('<hh', left_int, right_int))
            
        wav.writeframes(frames)
    print(f"Generated {filename} ({duration}s at {bpm} BPM)")

# Synth helper oscillators
def osc(freq, t, type='sine'):
    phase = 2.0 * math.pi * freq * t
    if type == 'sine':
        return math.sin(phase)
    elif type == 'square':
        return 0.8 if math.sin(phase) > 0 else -0.8
    elif type == 'saw':
        return 2.0 * (t * freq - math.floor(t * freq + 0.5))
    elif type == 'triangle':
        return 2.0 * abs(2.0 * (t * freq - math.floor(t * freq + 0.5))) - 1.0
    return math.sin(phase)

def decay(time_in_hit, length):
    if time_in_hit < 0 or time_in_hit > length:
        return 0.0
    return math.exp(-time_in_hit * (5.0 / length))

# Track 1: Zero-G Ambient (112 BPM)
def track_1_generator(t, beat, sixteenth):
    left = 0.0
    right = 0.0
    
    # 1. Kick (beats 0 and 2 of 4-beat bar)
    bar_pos = t % (beat * 4)
    kick_pos = bar_pos % (beat * 2)
    if kick_pos < 0.25:
        env = decay(kick_pos, 0.22)
        pitch = 120.0 * math.exp(-kick_pos * 24.0) + 38.0
        kick_sound = math.sin(2.0 * math.pi * pitch * kick_pos) * env * 0.7
        left += kick_sound
        right += kick_sound
        
    # 2. Hi-hats every 8th note
    hat_pos = t % (beat * 0.5)
    if hat_pos < 0.08:
        env = decay(hat_pos, 0.07)
        # Noise approximation
        noise = math.sin(t * 88400.0) * math.cos(t * 43100.0)
        hat = noise * env * 0.18
        left += hat * 0.7
        right += hat * 1.0
        
    # 3. Ambient Pad chords (F#m, A, C#m, Bm)
    chord_len = beat * 8
    chord_idx = int(t / chord_len) % 4
    chords = [
        [185.00, 220.00, 277.18],  # F#m
        [220.00, 277.18, 329.63],  # A
        [138.59, 164.81, 207.65],  # C#m
        [123.47, 146.83, 185.00],  # Bm
    ]
    cur_chord = chords[chord_idx]
    
    for f in cur_chord:
        p1 = math.sin(t * 0.5) * 0.25 + 0.5
        s1 = osc(f, t, 'triangle') * 0.12
        s2 = osc(f * 1.004, t, 'sine') * 0.10
        left += (s1 + s2) * p1
        right += (s1 + s2) * (1.0 - p1)
        
    # 4. Deep Sub Bass
    root_freq = cur_chord[0] * 0.5
    bass_pos = t % beat
    if bass_pos < beat * 0.9:
        bass_env = decay(bass_pos, beat * 0.85)
        sub = osc(root_freq, t, 'sine') * bass_env * 0.45
        left += sub
        right += sub
        
    return left, right

# Track 2: Neural Drift (Cyber Phonk Synth, 128 BPM)
def track_2_generator(t, beat, sixteenth):
    left = 0.0
    right = 0.0
    
    # 1. Punchy Kick & 808
    bar_pos = t % (beat * 4)
    # Kick pattern: 0, 1.75, 2.5
    kick_hits = [0, beat * 1.75, beat * 2.5]
    for h in kick_hits:
        dt = bar_pos - h
        if 0 <= dt < 0.22:
            env = decay(dt, 0.2)
            pitch = 160.0 * math.exp(-dt * 30.0) + 42.0
            k = math.sin(2.0 * math.pi * pitch * dt) * env * 0.8
            left += k
            right += k
            
    # 2. Snare / Clap on beat 2 and 4
    snare_hits = [beat * 1.0, beat * 3.0]
    for h in snare_hits:
        dt = bar_pos - h
        if 0 <= dt < 0.18:
            env = decay(dt, 0.16)
            noise = math.sin(t * 114200.0) * math.sin(t * 31200.0)
            snare = (noise * 0.4 + math.sin(2.0 * math.pi * 220.0 * dt) * 0.3) * env
            left += snare * 0.8
            right += snare * 0.8
            
    # 3. Phonk Cowbell / Arp Melody (D minor pentatonic)
    notes = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33]
    step_idx = int(t / sixteenth) % 16
    dt_step = t % sixteenth
    if dt_step < 0.12 and step_idx % 2 == 0:
        freq = notes[(step_idx * 3) % len(notes)]
        env = decay(dt_step, 0.11)
        synth = (osc(freq, t, 'saw') * 0.2 + osc(freq * 2.0, t, 'sine') * 0.15) * env
        pan = math.sin(step_idx) * 0.35 + 0.5
        left += synth * pan
        right += synth * (1.0 - pan)
        
    # 4. Saturated 808 Bassline
    bass_freq = 146.83 * 0.5 # D
    if step_idx >= 8:
        bass_freq = 174.61 * 0.5 # F
    sub = math.tanh(osc(bass_freq, t, 'sine') * 1.8) * 0.4
    left += sub
    right += sub
    
    return left, right

# Track 3: Chroma Pulse (Liquid Chrome Glitch, 140 BPM)
def track_3_generator(t, beat, sixteenth):
    left = 0.0
    right = 0.0
    
    # 1. Four-on-the-floor Kick
    beat_pos = t % beat
    if beat_pos < 0.2:
        env = decay(beat_pos, 0.18)
        pitch = 180.0 * math.exp(-beat_pos * 32.0) + 48.0
        k = math.sin(2.0 * math.pi * pitch * beat_pos) * env * 0.75
        left += k
        right += k
        
    # 2. Glitch clicks & hi-hats
    sub_step = t % (sixteenth * 0.5)
    if sub_step < 0.04:
        env = decay(sub_step, 0.035)
        h = osc(11200.0, t, 'square') * env * 0.12
        left += h * (0.8 if int(t / sixteenth) % 2 == 0 else 0.2)
        right += h * (0.2 if int(t / sixteenth) % 2 == 0 else 0.8)
        
    # 3. Liquid chord swell (Am9 - Fmaj7 - C - G)
    chord_len = beat * 4
    chord_idx = int(t / chord_len) % 4
    chords = [
        [220.00, 261.63, 329.63, 440.00],  # Am
        [174.61, 220.00, 261.63, 349.23],  # F
        [130.81, 164.81, 196.00, 261.63],  # C
        [196.00, 246.94, 293.66, 392.00],  # G
    ]
    cur_chord = chords[chord_idx]
    
    swell = 0.5 + 0.5 * math.sin(t * 3.5)
    for idx, f in enumerate(cur_chord):
        s = osc(f, t, 'saw') * 0.08 * swell
        pan = 0.3 + 0.4 * (idx / len(cur_chord))
        left += s * pan
        right += s * (1.0 - pan)
        
    # 4. Bouncing Reese Bass
    reese_freq = cur_chord[0] * 0.5
    reese = (osc(reese_freq, t, 'saw') + osc(reese_freq * 1.008, t, 'saw')) * 0.18
    left += reese
    right += reese
    
    return left, right

if __name__ == '__main__':
    # Generate 32s loops for each track
    create_track('audio/track-1.wav', 32.0, 112.0, track_1_generator)
    create_track('audio/track-2.wav', 32.0, 128.0, track_2_generator)
    create_track('audio/track-3.wav', 32.0, 140.0, track_3_generator)
    
    # Also copy to public/audio for standard Next.js / static folder conventions
    os.makedirs('public/audio', exist_ok=True)
    import shutil
    shutil.copy('audio/track-1.wav', 'public/audio/track-1.wav')
    shutil.copy('audio/track-2.wav', 'public/audio/track-2.wav')
    shutil.copy('audio/track-3.wav', 'public/audio/track-3.wav')
    print("All authorized local audio assets successfully generated and synced!")
