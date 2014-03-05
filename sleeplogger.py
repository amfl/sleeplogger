#!/usr/bin/python

import pygame
import time, sys
import datetime
import os

SLEEPLOG_FN = sys.argv[1] if len(sys.argv) > 1 else 'sleep.log'

# Write to stderr to avoid the SDL debug line that was left in
def log(string):
	sys.stderr.write(string+'\n')

def getTimestamp():
	format = '%Y.%m.%d %H-%M-%S'
	now = datetime.datetime.now()
	return now.strftime(format)

def writeToFile(prefix):
	string = "%s %s" % (prefix, getTimestamp())
	log(string)
	with open(SLEEPLOG_FN, 'a') as f:
		f.write(string+'\n')

def main():
	# Prevent pygame from initing video
	os.environ["SDL_VIDEODRIVER"] = "dummy"

	log("Initing pygame.")
	pygame.init()

	controllers = []
	for i in range(2):
		j = pygame.joystick.Joystick(i)
		j.init()
		controllers.append(j)
		log("Initialized joystick %d: %s" % (i, j.get_name()))

	# Begin main loop
	log("Beginning loop.")
#	lastPressed = None
	while True:
		pygame.event.wait()

		for j in controllers:
			for i in range(j.get_numbuttons()):
				if j.get_button(i): #and j != lastPressed:
					# lastPressed = j
					writeToFile('a' if j.get_id()==0 else 's')
					# Sleep to avoid spamming the log
					time.sleep(5)
	log("All done.")

if __name__ == "__main__":
	main()
