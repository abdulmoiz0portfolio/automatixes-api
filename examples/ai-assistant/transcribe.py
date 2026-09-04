import sys
import os
import subprocess
import speech_recognition as sr

FFMPEG_PATH = r"C:\Users\Moiz Baig\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe"

def transcribe(audio_path):
    wav_path = audio_path + ".temp.wav"
    try:
        # Convert any format (ogg, opus, mp3, mp4) to 16kHz mono wav
        cmd = [
            FFMPEG_PATH, "-y", "-i", audio_path,
            "-ar", "16000", "-ac", "1", wav_path
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        
        r = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = r.record(source)
            
        # 1. Try Urdu (Pakistan)
        try:
            text = r.recognize_google(audio_data, language="ur-PK")
            if text:
                return text
        except Exception:
            pass
            
        # 2. Try English
        try:
            text = r.recognize_google(audio_data, language="en-US")
            if text:
                return text
        except Exception:
            pass

        # 3. Try Hindi
        try:
            text = r.recognize_google(audio_data, language="hi-IN")
            if text:
                return text
        except Exception:
            pass
            
        return ""
    except Exception as e:
        return ""
    finally:
        if os.path.exists(wav_path):
            try:
                os.remove(wav_path)
            except Exception:
                pass

if __name__ == "__main__":
    if len(sys.argv) > 1:
        audio_file = sys.argv[1]
        result = transcribe(audio_file)
        sys.stdout.reconfigure(encoding='utf-8')
        print(result)
