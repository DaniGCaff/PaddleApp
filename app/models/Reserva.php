<?php

class Reserva extends \Illuminate\Database\Eloquent\Model
{
    protected $table = 'reservas';
    public $timestamps  = false;

    public function hasUser() {
        return $this->hasOne('\User', 'id', 'userId');
    }
}