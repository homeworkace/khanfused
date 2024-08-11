import sqlite3
import math
import time

class khanfused_db :
	def __init__(self) :
		self.write(
			'''CREATE TABLE IF NOT EXISTS "Sessions" (
			"id" INTEGER NOT NULL UNIQUE,
			"last_active"	INTEGER NOT NULL,
			"name" STRING,
			PRIMARY KEY("id")
			);'''
			)
		
	def new_session(self, session_id) :
		self.write(
			'''INSERT INTO Sessions (id, last_active) VALUES (?, ?)''', (
				session_id, math.floor(time.time())
				)
			)
		
	def refresh_session(self, session_id) :
		self.write(
			'''UPDATE Sessions SET last_active = ? WHERE id = ?''', (
				math.floor(time.time()), session_id
				)
			)

	def clear_sessions(self, age_in_seconds) :
		self.write(
			'''DELETE FROM Sessions WHERE last_active < ?''', (
				math.floor(time.time()) - age_in_seconds,
				)
			)
		
	def query_session(self, session_id) :
		result = self.write(
			'''SELECT * FROM Sessions WHERE id = ?''', (
				session_id,
				)
			)
		if len(result) < 1 :
			return None
		return result[0]

	def write(self, command, parameters = ()) :
		database = sqlite3.connect('khanfused.db')
		cursor = database.cursor()
		cursor.execute(command, parameters)
		result = cursor.fetchall()
		database.commit()
		database.close()
		return result