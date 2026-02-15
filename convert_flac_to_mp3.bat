@echo off
REM Check if ffmpeg is installed
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo Installing ffmpeg...
    choco install ffmpeg -y
    if errorlevel 1 (
        echo Error: ffmpeg installation failed. Please install ffmpeg manually.
        pause
        exit /b 1
    )
)

REM Create audio directory
if not exist "src\assets\audio" mkdir "src\assets\audio"

echo Converting FLAC files to MP3 previews...
echo.

REM Track 01 - Speak to Me
ffmpeg -i "01 - Pink Floyd - Speak to Me (2023 Remaster) (Explicit).flac" -ss 0 -t 30 -b:a 128k -y "src\assets\audio\track-01-speak-to-me-preview.mp3"

REM Track 02 - Breathe
ffmpeg -i "02 - Pink Floyd - Breathe (In the Air) (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src\assets\audio\track-02-breathe-preview.mp3"

REM Track 03 - On the Run
ffmpeg -i "03 - Pink Floyd - On the Run (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src\assets\audio\track-03-on-the-run-preview.mp3"

REM Track 04 - Time
ffmpeg -i "04 - Pink Floyd - Time (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src\assets\audio\track-04-time-preview.mp3"

REM Track 05 - The Great Gig in the Sky
ffmpeg -i "05 - Pink Floyd - The Great Gig in the Sky (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src\assets\audio\track-05-the-great-gig-in-the-sky-preview.mp3"

REM Track 06 - Money
ffmpeg -i "06 - Pink Floyd - Money (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src\assets\audio\track-06-money-preview.mp3"

REM Track 07 - Us and Them
ffmpeg -i "07 - Pink Floyd - Us and Them (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src\assets\audio\track-07-us-and-them-preview.mp3"

REM Track 08 - Any Colour You Like
ffmpeg -i "08 - Pink Floyd - Any Colour You Like (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src\assets\audio\track-08-any-colour-you-like-preview.mp3"

REM Track 09 - Brain Damage
ffmpeg -i "09 - Pink Floyd - Brain Damage (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src\assets\audio\track-09-brain-damage-preview.mp3"

REM Track 10 - Eclipse
ffmpeg -i "10 - Pink Floyd - Eclipse (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src\assets\audio\track-10-eclipse-preview.mp3"

echo.
echo Conversion complete! Files are in: src\assets\audio\
pause
