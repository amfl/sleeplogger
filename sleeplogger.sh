#! /bin/bash
# /etc/init.d/sleeplogger.sh

### BEGIN INIT INFO
# Provides:          sleeplogger
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: A sleep logger in python.
# Description:       A sleep logger in python
### END INIT INFO

# Followed this guide. http://www.stuffaboutcode.com/2012/06/raspberry-pi-run-program-at-start-up.html

# Carry out specific functions when asked to by the system
case "$1" in
  start)
    echo "Starting sleeplogger"
    /home/pi/sleeplogger/sleeplogger.py /home/pi/sleeplogger/sleep.log > /dev/null &
    ;;
  stop)
    echo "Stopping sleeplogger"
    killall -9 sleeplogger.py
    ;;
  *)
    echo "Usage: /etc/init.d/sleeplogger {start|stop}"
    exit 1
    ;;
esac
