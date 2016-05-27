<?php

class User extends \Illuminate\Database\Eloquent\Model
{
    protected $table = 'users';
    public $timestamps  = false;

    public function getRoles()
    {
        return $this->belongsToMany('\Role', 'users_roles', 'user_id', 'role_id');
    }
}